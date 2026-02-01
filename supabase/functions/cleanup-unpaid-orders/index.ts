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
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    console.log('Cleaning up unpaid orders older than:', oneHourAgo);

    // Delete orders that are still 'pending' and created more than 1 hour ago
    const { data: deletedOrders, error } = await supabase
      .from('orders')
      .delete()
      .eq('status', 'pending')
      .lt('created_at', oneHourAgo)
      .select('id, customer_name, total_price, created_at');

    if (error) {
      console.error('Error deleting unpaid orders:', error);
      throw new Error('Failed to cleanup unpaid orders');
    }

    const deletedCount = deletedOrders?.length || 0;
    console.log(`Deleted ${deletedCount} unpaid orders:`, deletedOrders);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `ลบออเดอร์ที่ไม่ชำระเงินภายใน 1 ชั่วโมง จำนวน ${deletedCount} รายการ`,
        deletedCount,
        deletedOrders
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
