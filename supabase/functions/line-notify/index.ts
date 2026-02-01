import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, orderId } = await req.json();
    const LINE_MESSAGING_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_MESSAGING_CHANNEL_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LINE_MESSAGING_CHANNEL_ACCESS_TOKEN) {
      throw new Error('LINE_MESSAGING_CHANNEL_ACCESS_TOKEN is not configured');
    }

    if (!orderId || !type) {
      throw new Error('Missing orderId or notification type');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    if (!order.line_user_id) {
      console.log('No LINE user ID for order:', orderId);
      return new Response(
        JSON.stringify({ success: true, message: 'No LINE user ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let flexMessage: any;
    const customerName = order.customer_name || 'Customer';
    const serviceName = order.service_name || 'Service';
    const price = order.total_price?.toLocaleString() || '0';

    switch (type) {
      case 'payment_success':
        flexMessage = {
          type: 'flex',
          altText: '✅ ชำระเงินสำเร็จ!',
          contents: {
            type: 'bubble',
            header: {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#22c55e',
              paddingAll: '15px',
              contents: [
                {
                  type: 'text',
                  text: '✅ ชำระเงินสำเร็จ',
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
                  text: `${price} บาท`,
                  size: 'xxl',
                  weight: 'bold',
                  color: '#22c55e',
                },
                {
                  type: 'separator',
                  margin: 'md',
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  margin: 'md',
                  contents: [
                    { type: 'text', text: '📋 บริการ', size: 'sm', color: '#888888', flex: 1 },
                    { type: 'text', text: serviceName, size: 'sm', wrap: true, flex: 2 },
                  ],
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  margin: 'sm',
                  contents: [
                    { type: 'text', text: '👤 ชื่อ', size: 'sm', color: '#888888', flex: 1 },
                    { type: 'text', text: customerName, size: 'sm', flex: 2 },
                  ],
                },
              ],
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'เรากำลังดำเนินการตามออเดอร์ครับ',
                  size: 'sm',
                  color: '#888888',
                  align: 'center',
                },
              ],
            },
          },
        };
        break;

      case 'work_completed':
        flexMessage = {
          type: 'flex',
          altText: '🎉 งานเสร็จแล้ว - MeowAcademy',
          contents: {
            type: 'carousel',
            contents: [
              {
                type: 'bubble',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#22c55e',
                  paddingAll: '15px',
                  contents: [
                    {
                      type: 'text',
                      text: '🎉 งานเสร็จแล้ว!',
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
                      text: `สวัสดีครับ คุณ${customerName}`,
                      size: 'md',
                      wrap: true,
                    },
                    {
                      type: 'text',
                      text: 'งานของคุณเสร็จเรียบร้อยแล้วครับ 🎊',
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
                        { type: 'text', text: serviceName, size: 'sm', wrap: true, flex: 2 },
                      ],
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      margin: 'sm',
                      contents: [
                        { type: 'text', text: '📝 รหัส', size: 'sm', color: '#888888', flex: 1 },
                        { type: 'text', text: orderId.slice(0, 8) + '...', size: 'sm', flex: 2 },
                      ],
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      margin: 'sm',
                      contents: [
                        { type: 'text', text: '📊 สถานะ', size: 'sm', color: '#888888', flex: 1 },
                        { type: 'text', text: 'เสร็จสิ้น ✅', size: 'sm', color: '#22c55e', weight: 'bold', flex: 2 },
                      ],
                    },
                  ],
                },
                footer: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '🐱 ขอบคุณที่ใช้บริการ MeowAcademy',
                      size: 'sm',
                      color: '#888888',
                      align: 'center',
                    },
                    {
                      type: 'text',
                      text: 'หวังว่าจะได้รับใช้อีกนะครับ 💕',
                      size: 'xs',
                      color: '#aaaaaa',
                      align: 'center',
                      margin: 'sm',
                    },
                  ],
                },
              },
              // Second Bubble: Rating Instruction
              {
                type: 'bubble',
                body: {
                  type: 'box',
                  layout: 'vertical',
                  paddingAll: '20px',
                  contents: [
                    {
                      type: 'text',
                      text: '⭐ ให้คะแนนบริการ',
                      weight: 'bold',
                      size: 'lg',
                      align: 'center',
                      color: '#1e3a5f'
                    },
                    {
                      type: 'text',
                      text: 'ความพึงพอใจของคุณคือกำลังใจของเรา',
                      size: 'xs',
                      color: '#888888',
                      align: 'center',
                      margin: 'md'
                    },
                    {
                      type: 'separator',
                      margin: 'lg'
                    },
                    {
                      type: 'text',
                      text: 'พิมพ์คะแนน (1-5) ตามด้วยความคิดเห็น\nแล้วกดส่งในแชทได้เลยครับ',
                      size: 'sm',
                      color: '#1e3a5f',
                      align: 'center',
                      margin: 'lg',
                      wrap: true
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      backgroundColor: '#f1f5f9',
                      cornerRadius: 'md',
                      paddingAll: '10px',
                      margin: 'md',
                      contents: [
                        {
                          type: 'text',
                          text: 'ตัวอย่าง:',
                          size: 'xs',
                          color: '#888888',
                          weight: 'bold'
                        },
                        {
                          type: 'text',
                          text: '"5 บริการดีมากครับ รวดเร็วทันใจ"',
                          size: 'sm',
                          color: '#334155',
                          wrap: true,
                          margin: 'xs'
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        };
        break;

      default:
        throw new Error('Invalid notification type');
    }

    // Send Push Message
    const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: order.line_user_id,
        messages: [flexMessage],
      }),
    });

    if (!lineResponse.ok) {
      const errorText = await lineResponse.text();
      throw new Error(`LINE API error: ${lineResponse.status} - ${errorText}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Line notify error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
