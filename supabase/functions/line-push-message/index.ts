import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushMessageRequest {
  lineUserId: string;
  message: string;
  customerName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LINE_MESSAGING_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_MESSAGING_CHANNEL_ACCESS_TOKEN')?.trim();

    if (!LINE_MESSAGING_CHANNEL_ACCESS_TOKEN) {
      console.error('LINE_MESSAGING_CHANNEL_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'LINE credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lineUserId, message, customerName } = await req.json() as PushMessageRequest;

    if (!lineUserId || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing lineUserId or message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending push message to:', lineUserId);
    console.log('Message:', message);

    // Send push message via LINE Messaging API
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [
          {
            type: 'flex',
            altText: '📬 ข้อความจากแอดมิน MeowAcademy',
            contents: {
              type: 'bubble',
              header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#f97316',
                paddingAll: '15px',
                contents: [
                  {
                    type: 'text',
                    text: '📬 ข้อความจากแอดมิน',
                    color: '#ffffff',
                    weight: 'bold',
                    size: 'lg',
                  },
                ],
              },
              body: {
                type: 'box',
                layout: 'vertical',
                spacing: 'md',
                contents: [
                  {
                    type: 'text',
                    text: message,
                    wrap: true,
                    size: 'md',
                  },
                ],
              },
              footer: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: '🐱 MeowAcademy Team',
                    size: 'sm',
                    color: '#888888',
                    align: 'center',
                  },
                ],
              },
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LINE API error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: `LINE API error: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Push message sent successfully to:', lineUserId);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in line-push-message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
