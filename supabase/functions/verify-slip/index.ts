import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Slip2Go API endpoint for verifying slips via Base64 image
const SLIP2GO_VERIFY_URL = 'https://connect.slip2go.com/api/verify-slip/qr-base64/info';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SLIP2GO_SECRET_KEY = Deno.env.get('SLIP2GO_SECRET_KEY');
    if (!SLIP2GO_SECRET_KEY) {
      throw new Error('SLIP2GO_SECRET_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { orderId, imageBase64, expectedAmount } = await req.json();

    if (!orderId || !imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: orderId, imageBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying slip for order:', orderId, 'Expected amount:', expectedAmount);

    // Call Slip2Go API to verify the slip
    const verifyResponse = await fetch(SLIP2GO_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLIP2GO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        payload: {
          imageBase64: `data:image/jpeg;base64,${imageBase64}`,
          checkCondition: {
            checkDuplicate: true,
            // Check if amount matches (optional)
            ...(expectedAmount && {
              checkAmount: {
                type: 'gte',
                amount: parseFloat(expectedAmount).toString()
              }
            })
          }
        }
      }),
    });

    const verifyResult = await verifyResponse.json();
    console.log('Slip2Go verify response:', JSON.stringify(verifyResult));
    console.log('Response code:', verifyResult.code, 'Type:', typeof verifyResult.code);

    if (!verifyResponse.ok) {
      throw new Error(verifyResult.message || `Slip2Go API error: ${verifyResponse.status}`);
    }

    // Check verification result
    // Observed success codes: "200200" (message: "Slip is valid.")
    // Known failure codes: "200401" = Recipient Mismatch, "200500" = Fraud, "200501" = Duplicate
    const responseCode = String(verifyResult.code ?? '');
    const isSuccess = responseCode === '200' || responseCode.startsWith('2002');
    const isDuplicate = responseCode === '200501' || verifyResult.data?.isDuplicate === true;
    const isFraud = responseCode === '200500';
    const isReceiverMismatch = responseCode === '200401';

    if (isDuplicate) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'สลิปนี้ถูกใช้ไปแล้ว กรุณาใช้สลิปใหม่',
          isDuplicate: true 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (isFraud) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'สลิปไม่ถูกต้องหรือเป็นสลิปปลอม กรุณาใช้สลิปจริง',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (isReceiverMismatch) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'บัญชีผู้รับไม่ตรงกัน กรุณาโอนเงินไปยังบัญชีที่ถูกต้อง',
          verificationData: verifyResult.data
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isSuccess) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: verifyResult.message || 'สลิปไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
          verificationData: verifyResult.data 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Slip is valid - update order status to 'paid'
    const { data: orderBeforeUpdate, error: fetchError } = await supabase
      .from('orders')
      .select('customer_name, service_name, total_price, line_user_id')
      .eq('id', orderId)
      .single();

    if (fetchError) {
      console.error('Error fetching order:', fetchError);
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        payment_method: 'promptpay',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw new Error('Failed to update order status');
    }

    console.log('Order', orderId, 'status updated to paid');

    // NOTE: LINE notification is NOT sent from web slip verification
    // - Web users see payment status directly on the website
    // - LINE users receive Flex Message from line-webhook when they send slip via LINE
    // This prevents duplicate notifications

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'ตรวจสอบสลิปสำเร็จ! การชำระเงินได้รับการยืนยันแล้ว',
        data: {
          orderId,
          status: 'paid',
          slipData: {
            amount: verifyResult.data?.amount,
            transactionDate: verifyResult.data?.transactionDate,
            senderName: verifyResult.data?.sender?.name,
            receiverName: verifyResult.data?.receiver?.name,
          }
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error verifying slip:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
