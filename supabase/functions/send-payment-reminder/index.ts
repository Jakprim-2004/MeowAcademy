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
    const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') || Deno.env.get('LINE_MESSAGING_CHANNEL_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LINE_CHANNEL_ACCESS_TOKEN) {
      throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find pending orders older than 23 hours (1 hour before auto-cancel at 24 hours)
    // that haven't been reminded yet
    const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: pendingOrders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .eq('reminder_sent', false)
      .lt('created_at', twentyThreeHoursAgo)
      .gte('created_at', oneDayAgo)
      .not('line_user_id', 'is', null);

    if (fetchError) {
      console.error('Error fetching orders:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingOrders?.length || 0} orders to send expiry warning`);

    let sentCount = 0;
    let failedCount = 0;

    for (const order of pendingOrders || []) {
      if (!order.line_user_id) continue;

      const priceFormatted = `${order.total_price.toLocaleString()} บาท`;

      // Send warning via LINE Push Message with Flex Message
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
              altText: '🚨 ออเดอร์กำลังจะหมดอายุใน 1 ชั่วโมง! - MeowAcademy',
              contents: {
                type: 'bubble',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#ef4444',
                  paddingAll: '15px',
                  contents: [
                    {
                      type: 'text',
                      text: '🚨 ออเดอร์กำลังจะหมดอายุ!',
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
                      text: '⚠️ ออเดอร์ของคุณจะถูกยกเลิกอัตโนมัติภายใน 1 ชั่วโมง หากยังไม่ชำระเงิน!',
                      size: 'sm',
                      color: '#ef4444',
                      wrap: true,
                      weight: 'bold',
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
                    {
                      type: 'box',
                      layout: 'horizontal',
                      margin: 'sm',
                      contents: [
                        { type: 'text', text: '⏳ หมดอายุ', size: 'sm', color: '#888888', flex: 1 },
                        { type: 'text', text: 'อีกประมาณ 1 ชั่วโมง', size: 'sm', color: '#ef4444', weight: 'bold', flex: 2 },
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
                      text: '📷 รีบส่งสลิปมาก่อนหมดเวลา!',
                      size: 'sm',
                      color: '#ef4444',
                      align: 'center',
                      weight: 'bold',
                    },
                    {
                      type: 'text',
                      text: 'ระบบจะยกเลิกออเดอร์อัตโนมัติ',
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
        console.log(`Expiry warning sent for order ${order.id}`);
      } else {
        const errorText = await pushResponse.text();
        console.error(`Failed to send warning for order ${order.id}:`, errorText);
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${sentCount} expiry warnings, ${failedCount} failed`,
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
