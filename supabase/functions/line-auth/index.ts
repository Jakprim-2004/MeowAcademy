import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const LINE_LOGIN_CHANNEL_ID = Deno.env.get("LINE_LOGIN_CHANNEL_ID")?.trim();
    const LINE_LOGIN_CHANNEL_SECRET = Deno.env.get("LINE_LOGIN_CHANNEL_SECRET")?.trim();
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("LINE_AUTH_DEBUG:", {
      hasChannelId: !!LINE_LOGIN_CHANNEL_ID,
      hasChannelSecret: !!LINE_LOGIN_CHANNEL_SECRET,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
      action: action,
    });

    if (!LINE_LOGIN_CHANNEL_ID || !LINE_LOGIN_CHANNEL_SECRET) {
      console.error("Missing LINE Login credentials");
      return new Response(
        JSON.stringify({ 
          error: "LINE Login credentials not configured",
          debug: "Please set LINE_LOGIN_CHANNEL_ID and LINE_LOGIN_CHANNEL_SECRET in Supabase secrets"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Get LINE Login URL
    if (action === "login-url") {
      const { redirectUri } = await req.json();
      
      const state = crypto.randomUUID();
      const nonce = crypto.randomUUID();
      
      const lineAuthUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
      lineAuthUrl.searchParams.set("response_type", "code");
      lineAuthUrl.searchParams.set("client_id", LINE_LOGIN_CHANNEL_ID);
      lineAuthUrl.searchParams.set("redirect_uri", redirectUri);
      lineAuthUrl.searchParams.set("state", state);
      lineAuthUrl.searchParams.set("scope", "profile openid email");
      lineAuthUrl.searchParams.set("nonce", nonce);

      console.log("Generated LINE auth URL for redirect:", redirectUri);

      return new Response(
        JSON.stringify({ url: lineAuthUrl.toString(), state }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Exchange code for token and create/login user
    if (action === "callback") {
      const { code, redirectUri } = await req.json();

      if (!code) {
        return new Response(
          JSON.stringify({ error: "Authorization code is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Exchanging LINE code for token...");

      // Exchange code for access token
      const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: LINE_LOGIN_CHANNEL_ID,
          client_secret: LINE_LOGIN_CHANNEL_SECRET,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error("LINE token error:", tokenData);
        return new Response(
          JSON.stringify({ error: tokenData.error_description || "Failed to get LINE token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Got LINE token, fetching profile...");

      // Get user profile
      const profileResponse = await fetch("https://api.line.me/v2/profile", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const profile = await profileResponse.json();

      if (!profile.userId) {
        console.error("Failed to get LINE profile");
        return new Response(
          JSON.stringify({ error: "Failed to get LINE profile" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("LINE profile retrieved:", profile.displayName);

      // Create Supabase admin client
      const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Generate a unique email for LINE user
      const lineEmail = `line_${profile.userId}@line.local`;
      const linePassword = `line_${profile.userId}_${LINE_LOGIN_CHANNEL_SECRET}`;

      // Try to sign in existing user first
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: lineEmail,
        password: linePassword,
      });

      if (signInData.session) {
        console.log("Existing LINE user signed in:", profile.displayName);
        return new Response(
          JSON.stringify({
            session: signInData.session,
            user: signInData.user,
            profile: {
              displayName: profile.displayName,
              pictureUrl: profile.pictureUrl,
              lineUserId: profile.userId,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create new user if doesn't exist
      console.log("Creating new LINE user:", profile.displayName);
      
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: lineEmail,
        password: linePassword,
        email_confirm: true,
        user_metadata: {
          full_name: profile.displayName,
          avatar_url: profile.pictureUrl,
          line_user_id: profile.userId,
          provider: "line",
        },
      });

      if (signUpError) {
        console.error("Failed to create LINE user:", signUpError);
        return new Response(
          JSON.stringify({ error: "Failed to create user account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Sign in the newly created user
      const { data: newSignInData, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
        email: lineEmail,
        password: linePassword,
      });

      if (newSignInError) {
        console.error("Failed to sign in new LINE user:", newSignInError);
        return new Response(
          JSON.stringify({ error: "Failed to sign in" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("New LINE user created and signed in:", profile.displayName);

      return new Response(
        JSON.stringify({
          session: newSignInData.session,
          user: newSignInData.user,
          profile: {
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            lineUserId: profile.userId,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("LINE auth error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
