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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') || Deno.env.get('LINE_MESSAGING_CHANNEL_ACCESS_TOKEN');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate 24 hours ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    console.log('Cancelling unpaid orders older than 24 hours. Cutoff:', oneDayAgo);

    // Find pending orders older than 24 hours
    const { data: expiredOrders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', oneDayAgo);

    if (fetchError) {
      console.error('Error fetching expired orders:', fetchError);
      throw new Error('Failed to fetch expired orders');
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      console.log('No expired orders found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'ไม่มีออเดอร์ที่ต้องยกเลิก',
          cancelledCount: 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let cancelledCount = 0;
    let notifiedCount = 0;

    for (const order of expiredOrders) {
      // Update status to cancelled
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error cancelling order ${order.id}:`, updateError);
        continue;
      }

      cancelledCount++;
      console.log(`Cancelled order ${order.id} - ${order.customer_name}`);

      // Send LINE notification about cancellation
      if (order.line_user_id && LINE_CHANNEL_ACCESS_TOKEN) {
        try {
          const priceFormatted = `${order.total_price?.toLocaleString() || 0} บาท`;

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
                  altText: '❌ ออเดอร์ถูกยกเลิกแล้ว - MeowAcademy',
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
                          text: '❌ ออเดอร์ถูกยกเลิกแล้ว',
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
                          text: 'ออเดอร์ของคุณถูกยกเลิกอัตโนมัติ เนื่องจากไม่ได้ชำระเงินภายใน 24 ชั่วโมง',
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
                            { type: 'text', text: order.service_name || '-', size: 'sm', wrap: true, flex: 2 },
                          ],
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          margin: 'sm',
                          contents: [
                            { type: 'text', text: '💰 ยอดเงิน', size: 'sm', color: '#888888', flex: 1 },
                            { type: 'text', text: priceFormatted, size: 'sm', flex: 2 },
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
                            { type: 'text', text: '📊 สถานะ', size: 'sm', color: '#888888', flex: 1 },
                            { type: 'text', text: 'ยกเลิกแล้ว ❌', size: 'sm', color: '#ef4444', weight: 'bold', flex: 2 },
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
                          text: 'หากต้องการสั่งใหม่ สามารถทำได้เลยครับ',
                          size: 'xs',
                          color: '#aaaaaa',
                          align: 'center',
                          wrap: true,
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
            notifiedCount++;
            console.log(`Cancellation notification sent for order ${order.id}`);
          } else {
            const errorText = await pushResponse.text();
            console.error(`Failed to send cancellation notification for order ${order.id}:`, errorText);
          }
        } catch (notifyError) {
          console.error(`Error sending notification for order ${order.id}:`, notifyError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `ยกเลิกออเดอร์ที่ไม่ชำระเงินภายใน 24 ชั่วโมง จำนวน ${cancelledCount} รายการ, แจ้งเตือน ${notifiedCount} ราย`,
        cancelledCount,
        notifiedCount,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in cleanup-unpaid-orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
