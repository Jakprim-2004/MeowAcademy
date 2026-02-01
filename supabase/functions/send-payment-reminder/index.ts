import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LINE_CHANNEL_ACCESS_TOKEN) {
      throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find pending orders older than 30 minutes that haven't been reminded
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: pendingOrders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .eq('reminder_sent', false)
      .lt('created_at', thirtyMinutesAgo)
      .not('line_user_id', 'is', null);

    if (fetchError) {
      console.error('Error fetching orders:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingOrders?.length || 0} orders to remind`);

    let sentCount = 0;
    let failedCount = 0;

    for (const order of pendingOrders || []) {
      if (!order.line_user_id) continue;

      const priceFormatted = `${order.total_price.toLocaleString()} บาท`;

      // Send reminder via LINE Push Message with Flex Message
      const pushResponse = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: order.line_user_id,
          messages: [
            {
              type: 'flex',
              altText: '⏰ เตือนชำระเงิน - MeowAcademy',
              contents: {
                type: 'bubble',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#f59e0b',
                  paddingAll: '15px',
                  contents: [
                    {
                      type: 'text',
                      text: '⏰ เตือนชำระเงิน',
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
                      text: `สวัสดีครับ คุณ${order.customer_name}`,
                      size: 'md',
                      wrap: true,
                    },
                    {
                      type: 'text',
                      text: 'ออเดอร์ของคุณยังรอชำระเงินอยู่นะครับ',
                      size: 'sm',
                      color: '#888888',
                      wrap: true,
                    },
                    {
                      type: 'separator',
                      margin: 'lg',
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      margin: 'lg',
                      contents: [
                        { type: 'text', text: '📋 บริการ', size: 'sm', color: '#888888', flex: 1 },
                        { type: 'text', text: order.service_name, size: 'sm', wrap: true, flex: 2 },
                      ],
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      margin: 'sm',
                      contents: [
                        { type: 'text', text: '💰 ยอดเงิน', size: 'sm', color: '#888888', flex: 1 },
                        { type: 'text', text: priceFormatted, size: 'sm', weight: 'bold', color: '#22c55e', flex: 2 },
                      ],
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      margin: 'sm',
                      contents: [
                        { type: 'text', text: '📝 รหัส', size: 'sm', color: '#888888', flex: 1 },
                        { type: 'text', text: order.id.slice(0, 8) + '...', size: 'sm', flex: 2 },
                      ],
                    },
                  ],
                },
                footer: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: '📷 ส่งรูปสลิปมาได้เลยครับ',
                      size: 'sm',
                      color: '#22c55e',
                      align: 'center',
                      weight: 'bold',
                    },
                    {
                      type: 'text',
                      text: 'ระบบจะตรวจสอบอัตโนมัติ',
                      size: 'xs',
                      color: '#aaaaaa',
                      align: 'center',
                    },
                    {
                      type: 'text',
                      text: '🐱 MeowAcademy',
                      size: 'xs',
                      color: '#888888',
                      align: 'center',
                      margin: 'md',
                    },
                  ],
                },
              },
            },
          ],
        }),
      });

      if (pushResponse.ok) {
        // Mark reminder as sent
        await supabase
          .from('orders')
          .update({ reminder_sent: true })
          .eq('id', order.id);

        sentCount++;
        console.log(`Reminder sent for order ${order.id}`);
      } else {
        const errorText = await pushResponse.text();
        console.error(`Failed to send reminder for order ${order.id}:`, errorText);
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${sentCount} reminders, ${failedCount} failed`,
        sentCount,
        failedCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in send-payment-reminder:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
