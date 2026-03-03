import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SlipOK API base URL — Branch ID and API Key are loaded from environment variables

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SLIPOK_API_KEY = Deno.env.get('SLIPOK_API_KEY');
    const SLIPOK_BRANCH_ID = Deno.env.get('SLIPOK_BRANCH_ID');
    if (!SLIPOK_API_KEY) {
      throw new Error('SLIPOK_API_KEY is not configured');
    }
    if (!SLIPOK_BRANCH_ID) {
      throw new Error('SLIPOK_BRANCH_ID is not configured');
    }
    const SLIPOK_VERIFY_URL = `https://api.slipok.com/api/line/apikey/${SLIPOK_BRANCH_ID}`;

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

    // Convert base64 to Uint8Array for multipart upload
    const binaryStr = atob(imageBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const imageBlob = new Blob([bytes], { type: 'image/jpeg' });

    // Build multipart/form-data for SlipOK
    const formData = new FormData();
    formData.append('files', imageBlob, 'slip.jpg');
    formData.append('log', 'true'); // Enable duplicate checking & logging

    // Optional: verify amount if provided
    if (expectedAmount) {
      formData.append('amount', parseFloat(expectedAmount).toString());
    }

    // Call SlipOK API to verify the slip
    const verifyResponse = await fetch(SLIPOK_VERIFY_URL, {
      method: 'POST',
      headers: {
        'x-authorization': SLIPOK_API_KEY,
      },
      body: formData,
    });

    const verifyResult = await verifyResponse.json();
    console.log('SlipOK verify response:', JSON.stringify(verifyResult));

    if (!verifyResponse.ok) {
      throw new Error(verifyResult.message || `SlipOK API error: ${verifyResponse.status}`);
    }

    // SlipOK returns { success: boolean, code: number, message: string, data: {...} }
    // success === false covers: duplicate (1003), fraud (1002), invalid (1001), receiver mismatch, etc.
    const isSuccess = verifyResult.success === true;
    const errorCode = verifyResult.code;

    // Known error codes from SlipOK
    const isDuplicate = !isSuccess && (errorCode === 1003 || verifyResult.message?.toLowerCase().includes('dupli'));
    const isFraud = !isSuccess && (errorCode === 1002 || verifyResult.message?.toLowerCase().includes('fraud'));
    const isReceiverMismatch = !isSuccess && (errorCode === 1004 || verifyResult.message?.toLowerCase().includes('receiver'));

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
            transactionDate: verifyResult.data?.transDate || verifyResult.data?.date,
            senderName: verifyResult.data?.sender?.name || verifyResult.data?.senderName,
            receiverName: verifyResult.data?.receiver?.name || verifyResult.data?.receiverName,
            transRef: verifyResult.data?.transRef,
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
