import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { orderId, carrier, serviceType } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Order ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        vendors (
          business_name,
          address,
          city,
          state,
          postal_code,
          country
        )
      `)
      .eq("id", orderId)
      .single();

    if (error || !order) {
      throw new Error("Order not found");
    }

    const trackingNumber = `${carrier.substring(0, 3).toUpperCase()}${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: 4in 6in; margin: 0; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 12px; }
          .label { border: 2px solid #000; padding: 15px; height: 100%; box-sizing: border-box; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .carrier { font-size: 24px; font-weight: bold; }
          .section { margin: 15px 0; }
          .section-title { font-weight: bold; font-size: 10px; color: #666; margin-bottom: 5px; }
          .address { font-size: 14px; line-height: 1.4; }
          .tracking { text-align: center; margin: 20px 0; }
          .tracking-number { font-size: 20px; font-weight: bold; font-family: monospace; letter-spacing: 2px; }
          .barcode { text-align: center; margin: 15px 0; }
          .barcode-placeholder { background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px); height: 60px; margin: 10px 0; }
          .footer { text-align: center; font-size: 10px; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="header">
            <div class="carrier">${carrier || 'STANDARD SHIPPING'}</div>
            <div>${serviceType || 'Ground Service'}</div>
            <div style="background: #111; color: white; padding: 8px; margin-top: 10px; text-align: center;">
              <div style="font-weight: bold; font-size: 14px;">SUFI SCIENCE CENTER USA</div>
              <div style="font-size: 10px;">Official Marketplace Shipping Label</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">FROM:</div>
            <div class="address">
              <strong>${order.vendors.business_name}</strong><br>
              ${order.vendors.address || 'N/A'}<br>
              ${order.vendors.city}, ${order.vendors.state} ${order.vendors.postal_code}<br>
              ${order.vendors.country || 'USA'}
            </div>
          </div>

          <div class="section">
            <div class="section-title">TO:</div>
            <div class="address">
              <strong>${order.customer_name}</strong><br>
              ${order.shipping_address.street}<br>
              ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}<br>
              ${order.shipping_address.country}
            </div>
          </div>

          <div class="tracking">
            <div class="section-title">TRACKING NUMBER</div>
            <div class="tracking-number">${trackingNumber}</div>
          </div>

          <div class="barcode">
            <div class="barcode-placeholder"></div>
            <div style="font-family: monospace; font-size: 10px;">${trackingNumber}</div>
          </div>

          <div class="footer">
            <div>Order: ${order.order_number}</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Weight: N/A | Dimensions: N/A</div>
            <div style="font-weight: bold; margin-top: 5px;">Sufi Science Center USA</div>
          </div>
        </div>
      </body>
      </html>
    `;

    await supabase.from("shipments").insert({
      vendor_id: order.vendor_id,
      order_id: orderId,
      tracking_number: trackingNumber,
      carrier: carrier || 'Standard',
      shipping_method: serviceType || 'Ground',
      status: 'pending',
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return new Response(
      JSON.stringify({
        html,
        trackingNumber,
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating shipping label:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate label" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});