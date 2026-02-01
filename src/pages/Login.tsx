import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Cat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle LINE callback
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      toast.error("การเข้าสู่ระบบถูกยกเลิก");
      return;
    }

    if (code) {
      handleLineCallback(code);
    }
  }, [searchParams]);

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLineCallback = async (code: string) => {
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/login`;

      // Call edge function to exchange code for session
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-auth?action=callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ code, redirectUri }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const { session, profile } = data;

      if (session) {
        // Set the session in Supabase client
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        toast.success(`ยินดีต้อนรับ ${profile?.displayName || ""}!`);
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      console.error("LINE login error:", error);
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      toast.error(errorMessage);
      // Clear the URL params on error
      window.history.replaceState({}, document.title, "/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineLogin = async () => {
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/login`;

      // Call edge function to get LINE auth URL
      const urlResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-auth?action=login-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ redirectUri }),
        }
      );

      const data = await urlResponse.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to LINE login
      window.location.href = data.url;
    } catch (error: unknown) {
      console.error("LINE login error:", error);
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Show loading when processing callback
  if (searchParams.get("code")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">กำลังเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-14 h-14 rounded-xl bg-hero-gradient flex items-center justify-center shadow-glow">
              <Cat className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-gradient">MeowAcademy</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-6 mb-2">
            เข้าสู่ระบบ
          </h1>
          <p className="text-muted-foreground">
            เข้าสู่ระบบด้วยบัญชี LINE ของคุณ
          </p>
        </div>

        {/* LINE Login Button */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-card border border-border p-8 shadow-sm">
            <Button
              onClick={handleLineLogin}
              disabled={isLoading}
              size="lg"
              className="w-full h-14 bg-[#00B900] hover:bg-[#00A000] text-primary-foreground font-semibold text-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <svg
                  className="w-6 h-6 mr-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
              )}
              เข้าสู่ระบบด้วย LINE
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              เมื่อเข้าสู่ระบบ แสดงว่าคุณยอมรับ
              <br />
              <a href="#" className="text-primary hover:underline">ข้อกำหนดการใช้งาน</a>
              {" "}และ{" "}
              <a href="#" className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
