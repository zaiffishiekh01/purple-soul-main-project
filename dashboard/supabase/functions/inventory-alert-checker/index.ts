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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: lowStockItems, error } = await supabase
      .from("inventory")
      .select(`
        *,
        vendors (
          id,
          email,
          business_name
        )
      `)
      .lte("quantity", supabase.rpc("low_stock_threshold"));

    if (error) {
      console.error("Error fetching low stock items:", error);
      throw error;
    }

    const alertsSent: string[] = [];
    const vendorAlerts = new Map<string, any[]>();

    for (const item of lowStockItems || []) {
      const vendorId = item.vendor_id;
      if (!vendorAlerts.has(vendorId)) {
        vendorAlerts.set(vendorId, []);
      }
      vendorAlerts.get(vendorId)?.push(item);
    }

    for (const [vendorId, items] of vendorAlerts) {
      const vendor = items[0].vendors;
      
      await supabase.from("notifications").insert(
        items.map((item) => ({
          vendor_id: vendorId,
          type: "inventory_alert",
          title: "Low Stock Alert",
          message: `${item.product_name} is running low (${item.quantity} units remaining)`,
          priority: item.quantity === 0 ? "high" : "medium",
          is_read: false,
        }))
      );

      if (resendApiKey && vendor.email) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
              .item { padding: 15px; border-bottom: 1px solid #ddd; }
              .alert { color: #dc2626; font-weight: bold; }
              .warning { color: #f59e0b; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Inventory Alert</h1>
              </div>
              <p>Hello ${vendor.business_name},</p>
              <p>The following items are running low on stock:</p>
              ${items
                .map(
                  (item) => `
                <div class="item">
                  <h3>${item.product_name}</h3>
                  <p>SKU: ${item.sku}</p>
                  <p class="${item.quantity === 0 ? "alert" : "warning"}">
                    Current Stock: ${item.quantity} units
                  </p>
                  <p>Low Stock Threshold: ${item.low_stock_threshold} units</p>
                  ${item.warehouse_location ? `<p>Location: ${item.warehouse_location}</p>` : ""}
                </div>
              `
                )
                .join("")}
              <p>Please restock these items to avoid stockouts.</p>
            </div>
          </body>
          </html>
        `;

        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "alerts@yourdomain.com",
              to: [vendor.email],
              subject: `Low Stock Alert - ${items.length} Item(s)`,
              html: emailHtml,
            }),
          });
          alertsSent.push(vendor.email);
        } catch (emailError) {
          console.error(`Failed to send email to ${vendor.email}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        lowStockCount: lowStockItems?.length || 0,
        alertsSent: alertsSent.length,
        vendors: vendorAlerts.size,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in inventory alert checker:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to check inventory" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});