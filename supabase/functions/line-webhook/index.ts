import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-line-signature',
};

interface LineEvent {
  type: string;
  replyToken?: string;
  source: {
    type: string;
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  message?: {
    type: string;
    id: string;
    text?: string;
    contentProvider?: {
      type: string;
    };
  };
  postback?: {
    data: string;
  };
}

interface LineWebhookBody {
  destination: string;
  events: LineEvent[];
}

// Verify LINE signature
function verifySignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
}

// Generate PromptPay EMV QR Code payload
function generatePromptPayPayload(promptPayId: string, amount: number): string {
  const sanitizedId = promptPayId.replace(/[^0-9]/g, '');

  let formattedId: string;
  if (sanitizedId.length === 10) {
    formattedId = '0066' + sanitizedId.substring(1);
  } else if (sanitizedId.length === 13) {
    formattedId = sanitizedId;
  } else if (sanitizedId.length === 9) {
    formattedId = '0066' + sanitizedId;
  } else {
    throw new Error('Invalid PromptPay ID');
  }

  const data: Array<{ id: string; value: string }> = [];
  data.push({ id: '00', value: '01' });
  data.push({ id: '01', value: '12' });

  const merchantData: Array<{ id: string; value: string }> = [];
  merchantData.push({ id: '00', value: 'A000000677010111' });
  merchantData.push({ id: '01', value: formattedId });
  const merchantPayload = merchantData.map(d => d.id + String(d.value.length).padStart(2, '0') + d.value).join('');
  data.push({ id: '29', value: merchantPayload });

  data.push({ id: '53', value: '764' });
  if (amount > 0) {
    data.push({ id: '54', value: amount.toFixed(2) });
  }
  data.push({ id: '58', value: 'TH' });

  let payload = data.map(d => d.id + String(d.value.length).padStart(2, '0') + d.value).join('');
  payload += '6304';

  let crc = 0xFFFF;
  const polynomial = 0x1021;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  payload += crc.toString(16).toUpperCase().padStart(4, '0');

  return payload;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use LINE_MESSAGING_CHANNEL_SECRET for webhook (separate from LINE Login)
    // Trim to avoid accidental trailing newlines/spaces in secrets
    const LINE_MESSAGING_CHANNEL_SECRET = Deno.env.get('LINE_MESSAGING_CHANNEL_SECRET')?.trim();
    const LINE_MESSAGING_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_MESSAGING_CHANNEL_ACCESS_TOKEN')?.trim();
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SLIPOK_API_KEY = 'SLIPOK3IHME1K';
    const SLIPOK_BRANCH_ID = '61807';

    if (!LINE_MESSAGING_CHANNEL_SECRET || !LINE_MESSAGING_CHANNEL_ACCESS_TOKEN) {
      console.error('Missing LINE credentials - MESSAGING_SECRET:', !!LINE_MESSAGING_CHANNEL_SECRET, 'ACCESS_TOKEN:', !!LINE_MESSAGING_CHANNEL_ACCESS_TOKEN);
      throw new Error('LINE credentials not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature');

    console.log('Received webhook request');
    console.log('Signature present:', !!signature);
    console.log('LINE_MESSAGING_CHANNEL_SECRET configured:', !!LINE_MESSAGING_CHANNEL_SECRET);
    console.log('SECRET length:', LINE_MESSAGING_CHANNEL_SECRET?.length);

    // Verify webhook signature using Messaging API Channel Secret
    // Verify webhook signature using Messaging API Channel Secret
    const isValid = signature ? verifySignature(rawBody, signature, LINE_MESSAGING_CHANNEL_SECRET) : false;
    console.log('Signature verification result:', isValid);

    if (!isValid) {
      console.error('Invalid LINE signature or missing signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: LineWebhookBody = JSON.parse(rawBody);
    console.log('Received LINE webhook:', JSON.stringify(body));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    for (const event of body.events) {
      const eventUserId = event.source.userId;
      if (!eventUserId) continue;

      // Handle image message (slip)
      if (event.type === 'message' && event.message?.type === 'image') {
        console.log('Received image from user:', eventUserId);

        // Find all pending orders for this user
        const { data: pendingOrders, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('line_user_id', eventUserId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (orderError) {
          console.error('Error fetching orders:', orderError);
        }

        if (!pendingOrders || pendingOrders.length === 0) {
          // No pending order
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'text',
              text: '❌ ไม่พบออเดอร์ที่รอชำระเงิน\n\nกรุณาสร้างออเดอร์ใหม่ก่อนส่งสลิปครับ 🐱',
            },
          ]);
          continue;
        }

        // Download image from LINE
        const imageContent = await fetch(
          `https://api-data.line.me/v2/bot/message/${event.message.id}/content`,
          {
            headers: {
              Authorization: `Bearer ${LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
            },
          }
        );

        if (!imageContent.ok) {
          console.error('Failed to download image from LINE');
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'text',
              text: '❌ ไม่สามารถรับรูปภาพได้ กรุณาลองใหม่อีกครั้งครับ',
            },
          ]);
          continue;
        }

        const imageBuffer = await imageContent.arrayBuffer();
        const uint8Array = new Uint8Array(imageBuffer);
        let imageBase64 = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, i + chunkSize);
          imageBase64 += String.fromCharCode(...chunk);
        }
        imageBase64 = btoa(imageBase64);

        console.log('Image downloaded, verifying slip...');

        // Verify slip with SlipOK
        if (!SLIPOK_API_KEY) {
          console.error('SLIPOK_API_KEY not configured (should not happen)');
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'text',
              text: '❌ ระบบตรวจสอบสลิปยังไม่พร้อมใช้งาน กรุณาติดต่อแอดมินครับ',
            },
          ]);
          continue;
        }

        // Convert Uint8Array to Blob for multipart upload
        const imageBlob = new Blob([uint8Array], { type: 'image/jpeg' });
        const slipForm = new FormData();
        slipForm.append('files', imageBlob, 'slip.jpg');
        slipForm.append('log', 'true'); // Enable duplicate detection & logging

        const verifyResponse = await fetch(`https://api.slipok.com/api/line/apikey/${SLIPOK_BRANCH_ID}`, {
          method: 'POST',
          headers: {
            'x-authorization': SLIPOK_API_KEY,
          },
          body: slipForm,
        });

        const verifyResult = await verifyResponse.json();
        console.log('SlipOK verify response:', JSON.stringify(verifyResult));

        // SlipOK returns { success: boolean, code: number, message: string, data: {...} }
        const isSuccess = verifyResult.success === true;
        const errorCode = verifyResult.code;
        const isDuplicate = !isSuccess && (errorCode === 1003 || verifyResult.message?.toLowerCase().includes('dupli'));
        const isFraud = !isSuccess && (errorCode === 1002 || verifyResult.message?.toLowerCase().includes('fraud'));

        if (isDuplicate) {
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'text',
              text: '❌ สลิปนี้ถูกใช้ไปแล้ว\n\nกรุณาใช้สลิปใหม่ครับ 🐱',
            },
          ]);
          continue;
        }

        if (isFraud) {
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'text',
              text: '❌ สลิปไม่ถูกต้อง\n\nกรุณาใช้สลิปจริงเท่านั้นครับ 🐱',
            },
          ]);
          continue;
        }

        if (!isSuccess) {
          let errorMessage = verifyResult.message || 'กรุณาลองใหม่อีกครั้งครับ';
          if (errorMessage.includes('Slip date is not in range')) {
            errorMessage = 'วันที่ในสลิปไม่ถูกต้อง (หมดอายุหรือนานเกินไป)';
          }
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'text',
              text: `❌ ไม่สามารถตรวจสอบสลิปได้\n\n${errorMessage} 🐱`,
            },
          ]);
          continue;
        }

        // Match slip amount with pending orders
        const slipAmount = parseFloat(verifyResult.data?.amount ?? '0') || 0;
        console.log(`Slip amount: ${slipAmount}, Finding matching order...`);

        // Find match: allow small difference (e.g. 0.01) if float issues, but usually strict is fine for THB
        // We pick the LATEST created order that matches the price
        const matchedOrder = pendingOrders.find(o => Math.abs(o.total_price - slipAmount) < 1);

        if (!matchedOrder) {
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'text',
              text: `❌ ยอดเงินในสลิป (${slipAmount} บาท) ไม่ตรงกับออเดอร์ใดๆ ที่ค้างอยู่ครับ 🐱\n\nกรุณาตรวจสอบยอดเงิน หรือสร้างออเดอร์ใหม่ให้ตรงกันครับ`,
            },
          ]);
          continue;
        }

        const pendingOrder = matchedOrder; // Use the matched order for processing
        console.log(`Matched order: ${pendingOrder.id} with price ${pendingOrder.total_price}`);

        // Upload slip image to storage bucket
        const slipFileName = `${pendingOrder.id}/${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-slips')
          .upload(slipFileName, uint8Array, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        let paymentProofUrl = null;
        if (uploadError) {
          console.error('Error uploading slip to storage:', uploadError);
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('payment-slips')
            .getPublicUrl(slipFileName);
          paymentProofUrl = urlData?.publicUrl || null;
          console.log('Slip uploaded to storage:', paymentProofUrl);
        }

        // Slip is valid - update order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_method: 'promptpay',
            payment_proof_url: paymentProofUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', pendingOrder.id);

        if (updateError) {
          console.error('Error updating order:', updateError);
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'text',
              text: '❌ เกิดข้อผิดพลาดในการอัปเดตออเดอร์ กรุณาติดต่อแอดมินครับ',
            },
          ]);
          continue;
        }

        console.log('Order updated to paid:', pendingOrder.id);

        // Send success Flex Message
        const priceFormatted = `${pendingOrder.total_price.toLocaleString()} บาท`;

        // Calculate excess payment (Should be 0 or small if we matched strictly, but logic exists)
        const excessAmount = slipAmount - pendingOrder.total_price;
        const hasExcess = excessAmount > 0;

        const messages: unknown[] = [
          {
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
                    text: priceFormatted,
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
                      { type: 'text', text: pendingOrder.service_name, size: 'sm', wrap: true, flex: 2 },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    margin: 'sm',
                    contents: [
                      { type: 'text', text: '👤 ชื่อ', size: 'sm', color: '#888888', flex: 1 },
                      { type: 'text', text: pendingOrder.customer_name, size: 'sm', flex: 2 },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    margin: 'sm',
                    contents: [
                      { type: 'text', text: '📊 สถานะ', size: 'sm', color: '#888888', flex: 1 },
                      { type: 'text', text: 'ชำระเงินแล้ว ✓', size: 'sm', color: '#22c55e', flex: 2 },
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
                    type: 'box',
                    layout: 'vertical',
                    backgroundColor: '#eff6ff',
                    cornerRadius: 'md',
                    paddingAll: '12px',
                    contents: [
                      {
                        type: 'text',
                        text: '⏳ กรุณารอดำเนินการ 1-3 วันทำการ',
                        size: 'sm',
                        weight: 'bold',
                        color: '#1d4ed8',
                        align: 'center',
                      },
                      {
                        type: 'text',
                        text: 'นับหลังจากวันที่ชำระเงิน',
                        size: 'xs',
                        color: '#3b82f6',
                        align: 'center',
                        margin: 'xs',
                      },
                    ],
                  },
                  {
                    type: 'text',
                    text: '🐱 ขอบคุณที่ใช้บริการ MeowAcademy',
                    size: 'sm',
                    color: '#888888',
                    align: 'center',
                    margin: 'md',
                  },
                  {
                    type: 'text',
                    text: 'เราจะแจ้งเตือนเมื่องานเสร็จครับ',
                    size: 'xs',
                    color: '#aaaaaa',
                    align: 'center',
                  },
                ],
              },
            },
          }
        ];

        // If excess payment, add a notification message
        if (hasExcess) {
          messages.push({
            type: 'flex',
            altText: '⚠️ มียอดโอนเกิน',
            contents: {
              type: 'bubble',
              body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '15px',
                backgroundColor: '#fff7ed',
                borderColor: '#f97316',
                borderWidth: '1px',
                cornerRadius: 'md',
                contents: [
                  {
                    type: 'text',
                    text: '⚠️ มียอดโอนเกินมาครับ',
                    weight: 'bold',
                    color: '#c2410c',
                    size: 'md'
                  },
                  {
                    type: 'text',
                    text: `จำนวน ${excessAmount.toLocaleString()} บาท`,
                    weight: 'bold',
                    color: '#c2410c',
                    size: 'xl',
                    margin: 'sm'
                  },
                  {
                    type: 'text',
                    text: 'กรุณาส่งชื่อและเลขบัญชีธนาคารมาทางแชทนี้ เพื่อให้เจ้าหน้าที่โอนเงินคืนให้ครับ 🐱',
                    wrap: true,
                    color: '#c2410c',
                    size: 'sm',
                    margin: 'md'
                  }
                ]
              }
            }
          });
        }

        await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, messages);
      }

      // Handle text message
      if (event.type === 'message' && event.message?.type === 'text') {
        const text = event.message.text?.trim() || '';

        // Check if text is a review (Starts with 1-5 followed by optional text)
        // Example: "5 Excellent service", "5", "4 Good but slow"
        const reviewMatch = text.match(/^([1-5])(?:\s+(.*))?$/);

        if (reviewMatch) {
          const rating = parseInt(reviewMatch[1]);
          const comment = reviewMatch[2] || '';

          // Find the latest COMPLETED order for this user to attach the review to
          const { data: latestCompletedOrder, error: orderError } = await supabase
            .from('orders')
            .select('id, customer_name, service_name')
            .eq('line_user_id', eventUserId)
            .eq('status', 'completed')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!latestCompletedOrder) {
            await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
              {
                type: 'text',
                text: '❌ ไม่พบงานที่เสร็จสิ้นล่าสุดเพื่อรีวิวครับ\n\n(ระบบจะรีวิวได้เฉพาะงานที่สถานะ "เสร็จสิ้น" แล้วเท่านั้น) 🐱',
              },
            ]);
          } else {
            // Upsert review (Insert or Update if exists for this order)
            const { error: reviewError } = await supabase
              .from('reviews')
              .upsert({
                order_id: latestCompletedOrder.id,
                rating: rating,
                comment: comment.length > 0 ? comment : null,
                is_published: true,
                user_id: null // System initiated, no auth user id needed here
              }, { onConflict: 'order_id' });

            if (reviewError) {
              console.error('Error saving review:', reviewError);
              await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
                {
                  type: 'text',
                  text: '❌ เกิดข้อผิดพลาดในการบันทึกรีวิว กรุณาลองใหม่ครับ',
                },
              ]);
            } else {
              await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
                {
                  type: 'text',
                  text: `⭐️ ได้รับคะแนน ${rating} ดาว เรียบร้อยแล้วครับ!\n\nขอบคุณสำหรับรีวิวครับ คุณ${latestCompletedOrder.customer_name} 🙏💕`,
                },
              ]);
            }
          }
        } else if (text.includes('สถานะ') || text.includes('ตรวจสอบ') || text === 'status') {
          // Find orders for this user
          const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('line_user_id', eventUserId)
            .order('created_at', { ascending: false })
            .limit(3);

          if (error || !orders?.length) {
            await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
              {
                type: 'text',
                text: '📋 ยังไม่มีออเดอร์ในระบบครับ\n\nกรุณาสร้างออเดอร์ใหม่ผ่านเว็บไซต์ 🐱',
              },
            ]);
          } else {
            const statusConfig: Record<string, { label: string; color: string; emoji: string }> = {
              pending: { label: 'รอชำระเงิน', color: '#eab308', emoji: '⏳' },
              paid: { label: 'ชำระแล้ว', color: '#3b82f6', emoji: '💳' },
              processing: { label: 'กำลังดำเนินการ', color: '#a855f7', emoji: '🔄' },
              completed: { label: 'เสร็จสิ้น', color: '#22c55e', emoji: '✅' },
              cancelled: { label: 'ยกเลิก', color: '#ef4444', emoji: '❌' },
            };

            // Create order content boxes for vertical layout
            const orderContents: Record<string, unknown>[] = [];

            orders.forEach((order, index) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const orderPriceFormatted = `${order.total_price.toLocaleString()} บาท`;

              // Add separator between orders
              if (index > 0) {
                orderContents.push({
                  type: 'separator',
                  margin: 'lg',
                });
              }

              // Order card box
              orderContents.push({
                type: 'box',
                layout: 'vertical',
                margin: index > 0 ? 'lg' : 'none',
                paddingAll: '12px',
                backgroundColor: '#f9fafb',
                cornerRadius: '8px',
                contents: [
                  // Status badge
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'box',
                        layout: 'vertical',
                        backgroundColor: status.color,
                        cornerRadius: '4px',
                        paddingAll: '4px',
                        contents: [
                          {
                            type: 'text',
                            text: `${status.emoji} ${status.label}`,
                            color: '#ffffff',
                            size: 'xs',
                            weight: 'bold',
                          },
                        ],
                      },
                    ],
                  },
                  // Service name
                  {
                    type: 'text',
                    text: order.service_name,
                    weight: 'bold',
                    size: 'md',
                    wrap: true,
                    margin: 'md',
                  },
                  // Price and customer name
                  {
                    type: 'box',
                    layout: 'horizontal',
                    margin: 'sm',
                    contents: [
                      {
                        type: 'text',
                        text: orderPriceFormatted,
                        size: 'lg',
                        weight: 'bold',
                        color: '#f97316',
                        flex: 1,
                      },
                      {
                        type: 'text',
                        text: `👤 ${order.customer_name}`,
                        size: 'xs',
                        color: '#888888',
                        align: 'end',
                        flex: 1,
                      },
                    ],
                  },
                  // Payment button for pending orders - use postback to show QR in LINE
                  ...(order.status === 'pending' ? [{
                    type: 'button',
                    action: {
                      type: 'postback',
                      label: '💳 ชำระเงินตอนนี้',
                      data: `action=pay&orderId=${order.id}`,
                      displayText: '💳 ขอ QR Code ชำระเงิน',
                    },
                    style: 'primary',
                    color: '#f97316',
                    margin: 'md',
                    height: 'sm',
                  }] : []),
                ],
              });
            });

            await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
              {
                type: 'flex',
                altText: '📋 ออเดอร์ล่าสุดของคุณ',
                contents: {
                  type: 'bubble',
                  header: {
                    type: 'box',
                    layout: 'vertical',
                    backgroundColor: '#1e3a5f',
                    paddingAll: '12px',
                    contents: [
                      {
                        type: 'text',
                        text: '📋 ออเดอร์ล่าสุดของคุณ',
                        color: '#ffffff',
                        weight: 'bold',
                        size: 'md',
                      },
                    ],
                  },
                  body: {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'none',
                    contents: orderContents,
                  },
                  footer: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '🐱 MeowAcademy - บริการของคุณ',
                        size: 'xs',
                        color: '#888888',
                        align: 'center',
                      },
                    ],
                  },
                },
              },
            ]);
          }
        } else if (text.includes('ช่วย') || text.includes('help') || text === '?') {
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'text',
              text: '🐱 วิธีใช้งาน MeowAcademy:\n\n' +
                '🔐 พิมพ์ "เข้าสู่ระบบ" - เข้าสู่เว็บไซต์\n' +
                '📷 ส่งรูปสลิป - ชำระเงินอัตโนมัติ\n' +
                '📋 พิมพ์ "สถานะ" - ดูสถานะออเดอร์\n' +
                '❓ พิมพ์ "ช่วย" - ดูวิธีใช้งาน',
            },
          ]);
        } else if (text.includes('เข้าสู่ระบบ') || text.includes('login') || text.includes('ล็อกอิน')) {
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'flex',
              altText: '🔐 เข้าสู่ระบบ MeowAcademy',
              contents: {
                type: 'bubble',
                body: {
                  type: 'box',
                  layout: 'vertical',
                  paddingAll: '20px',
                  contents: [
                    {
                      type: 'text',
                      text: '🔐 เข้าสู่ระบบ',
                      weight: 'bold',
                      size: 'xl',
                      align: 'center',
                      color: '#1e3a5f'
                    },
                    {
                      type: 'text',
                      text: 'เข้าสู่เว็บไซต์เพื่อจัดการออเดอร์',
                      size: 'sm',
                      color: '#888888',
                      align: 'center',
                      margin: 'md'
                    },
                    {
                      type: 'separator',
                      margin: 'lg'
                    },
                    {
                      type: 'button',
                      style: 'primary',
                      action: {
                        type: 'uri',
                        label: 'คลิกเพื่อเข้าสู่ระบบ',
                        uri: 'https://meowacademy.vercel.app/'
                      },
                      margin: 'lg',
                      color: '#f97316',
                      height: 'sm'
                    }
                  ]
                }
              }
            }
          ]);
        } else {
          // Echo back any other message for testing
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
             
            },
          ]);
        }
      }

     

      // Handle postback event (payment and RATE button click)
      if (event.type === 'postback' && event.postback?.data) {
        const postbackData = new URLSearchParams(event.postback.data);
        const action = postbackData.get('action');
        const orderId = postbackData.get('orderId');

        console.log('Postback received:', event.postback.data);

        if (action === 'pay' && orderId) {
          // Fetch the order
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('line_user_id', eventUserId)
            .maybeSingle();

          if (orderError || !order) {
            await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
              {
                type: 'text',
                text: '❌ ไม่พบออเดอร์นี้ในระบบ กรุณาลองใหม่อีกครั้งครับ 🐱',
              },
            ]);
            continue;
          }

          if (order.status !== 'pending') {
            const statusLabels: Record<string, string> = {
              paid: 'ชำระเงินแล้ว',
              processing: 'กำลังดำเนินการ',
              completed: 'เสร็จสิ้นแล้ว',
              cancelled: 'ถูกยกเลิก',
            };
            await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
              {
                type: 'text',
                text: `ℹ️ ออเดอร์นี้${statusLabels[order.status] || order.status}แล้วครับ 🐱`,
              },
            ]);
            continue;
          }

          // Generate PromptPay QR payload
          const PROMPTPAY_ID = Deno.env.get('PROMPTPAY_ID')?.trim();
          if (!PROMPTPAY_ID) {
            await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
              {
                type: 'text',
                text: '❌ ระบบชำระเงินยังไม่พร้อมใช้งาน กรุณาติดต่อแอดมินครับ',
              },
            ]);
            continue;
          }

          const qrPayload = generatePromptPayPayload(PROMPTPAY_ID, order.total_price);
          console.log('Generated QR payload for order:', orderId, 'amount:', order.total_price);

          // Generate QR code image URL using external service
          const qrImageUrl = `https://promptpay.io/${PROMPTPAY_ID}/${order.total_price}.png`;

          const priceFormatted = `${order.total_price.toLocaleString()} บาท`;

          // Send QR code Flex Message
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'flex',
              altText: `💳 สแกนชำระเงิน ${priceFormatted}`,
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
                      text: '💳 สแกน QR เพื่อชำระเงิน',
                      color: '#ffffff',
                      weight: 'bold',
                      size: 'lg',
                      align: 'center',
                    },
                  ],
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'md',
                  paddingAll: '20px',
                  contents: [
                    {
                      type: 'image',
                      url: qrImageUrl,
                      size: 'full',
                      aspectRatio: '1:1',
                      aspectMode: 'fit',
                    },
                    {
                      type: 'text',
                      text: priceFormatted,
                      size: 'xxl',
                      weight: 'bold',
                      color: '#f97316',
                      align: 'center',
                      margin: 'lg',
                    },
                    {
                      type: 'separator',
                      margin: 'lg',
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      margin: 'lg',
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '📋 บริการ', size: 'sm', color: '#888888', flex: 1 },
                            { type: 'text', text: order.service_name, size: 'sm', wrap: true, flex: 2 },
                          ],
                        },
                        {
                          type: 'box',
                          layout: 'horizontal',
                          contents: [
                            { type: 'text', text: '👤 ชื่อ', size: 'sm', color: '#888888', flex: 1 },
                            { type: 'text', text: order.customer_name, size: 'sm', flex: 2 },
                          ],
                        },
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
                      text: '📷 ชำระเสร็จแล้ว ส่งสลิปมาเลยครับ',
                      size: 'sm',
                      color: '#22c55e',
                      align: 'center',
                      weight: 'bold',
                    },
                    {
                      type: 'text',
                      text: 'ระบบจะตรวจสอบอัตโนมัติ 🐱',
                      size: 'xs',
                      color: '#888888',
                      align: 'center',
                      margin: 'sm',
                    },
                  ],
                },
              },
            },
          ]);
        } else if (action === 'rate' && orderId) {
          const rating = parseInt(postbackData.get('rating') || '0');
          if (rating <= 0) return;

          // Check if order exists and belongs to this user
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, customer_name')
            .eq('id', orderId)
            .eq('line_user_id', eventUserId)
            .maybeSingle();

          if (orderError || !order) {
            console.error('Order not found for rating:', orderError);
            await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
              {
                type: 'text',
                text: '❌ ไม่พบข้อมูลออเดอร์ครับ',
              },
            ]);
            continue;
          }

          // Check if already reviewed
          const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('order_id', orderId)
            .maybeSingle();

          if (existingReview) {
            await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
              {
                type: 'text',
                text: '⚠️ คุณได้รีวิวออเดอร์นี้ไปแล้วครับ ขอบคุณครับ 🙏',
              },
            ]);
            continue;
          }

          // Insert review
          const { error: insertError } = await supabase
            .from('reviews')
            .insert({
              order_id: orderId,
              rating: rating,
              comment: null,
              is_published: true
            });

          if (insertError) {
            console.error('Error inserting review:', insertError);
            await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
              {
                type: 'text',
                text: '❌ เกิดข้อผิดพลาดในการบันทึกรีวิว กรุณาลองใหม่ครับ',
              },
            ]);
            continue;
          }

          // Reply success
          await replyMessage(event.replyToken!, LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, [
            {
              type: 'text',
              text: `⭐️ ขอบคุณสำหรับคะแนน ${rating} ดาวครับ! 🙏\n\nเราดีใจที่ได้ให้บริการคุณ ${order.customer_name} ครับ 💕`,
            },
          ]);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in line-webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to reply to LINE messages
async function replyMessage(replyToken: string, accessToken: string, messages: unknown[]) {
  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to reply:', error);
  }
}
