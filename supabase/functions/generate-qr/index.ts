import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PromptPay account - Phone number or National ID (13 digits)
const PROMPTPAY_ID = Deno.env.get('PROMPTPAY_ID') || '';

// Generate PromptPay EMV QR Code payload locally (no external API needed)
function generatePromptPayPayload(promptPayId: string, amount: number): string {
  // Remove all non-digit characters
  const sanitizedId = promptPayId.replace(/[^0-9]/g, '');
  
  console.log('PromptPay ID after sanitization:', sanitizedId, 'length:', sanitizedId.length);
  
  // Determine ID type: phone (10 digits) or national ID (13 digits)
  let formattedId: string;
  if (sanitizedId.length === 10) {
    // Phone number: add country code 66, remove leading 0
    formattedId = '0066' + sanitizedId.substring(1);
  } else if (sanitizedId.length === 13) {
    // National ID: use as-is
    formattedId = sanitizedId;
  } else if (sanitizedId.length === 9) {
    // Phone without leading zero - assume Thai mobile
    formattedId = '0066' + sanitizedId;
  } else {
    throw new Error('Invalid PromptPay ID: must be 10 (phone) or 13 (national ID) digits');
  }

  // Build EMV QR Code data
  const data: Array<{ id: string; value: string }> = [];
  
  // Payload Format Indicator
  data.push({ id: '00', value: '01' });
  
  // Point of Initiation Method (12 = dynamic QR with amount)
  data.push({ id: '01', value: '12' });
  
  // Merchant Account Information for PromptPay
  const merchantData: Array<{ id: string; value: string }> = [];
  merchantData.push({ id: '00', value: 'A000000677010111' }); // PromptPay AID
  merchantData.push({ id: '01', value: formattedId }); // Proxy value
  const merchantPayload = merchantData.map(d => d.id + String(d.value.length).padStart(2, '0') + d.value).join('');
  data.push({ id: '29', value: merchantPayload });
  
  // Transaction Currency (764 = THB)
  data.push({ id: '53', value: '764' });
  
  // Transaction Amount
  if (amount > 0) {
    data.push({ id: '54', value: amount.toFixed(2) });
  }
  
  // Country Code
  data.push({ id: '58', value: 'TH' });
  
  // Build payload without CRC
  let payload = data.map(d => d.id + String(d.value.length).padStart(2, '0') + d.value).join('');
  payload += '6304'; // CRC ID and length
  
  // Calculate CRC16-CCITT
  const crc = calculateCRC16(payload);
  payload += crc;
  
  return payload;
}

function calculateCRC16(data: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!PROMPTPAY_ID) {
      throw new Error('PROMPTPAY_ID is not configured');
    }

    const { amount } = await req.json();

    if (!amount) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required field: amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating PromptPay QR code for amount:', amount);

    // Generate PromptPay payload locally
    const payload = generatePromptPayPayload(PROMPTPAY_ID, parseFloat(amount));
    console.log('Generated PromptPay payload:', payload);

    // Return the QR code payload
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          payload: payload,
          amount: parseFloat(amount),
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error generating QR code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
