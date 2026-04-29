import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    
    const url = new URL(req.url);
    const licenseKey = url.searchParams.get("license_key");

    if (!licenseKey) {
      return new Response(
        JSON.stringify({ error: "License key is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: license, error: licenseError } = await supabase
      .from("product_licenses")
      .select(`
        *,
        digital_product_files!inner(
          file_path,
          file_name,
          file_type,
          storage_url
        )
      `)
      .eq("license_key", licenseKey)
      .single();

    if (licenseError || !license) {
      return new Response(
        JSON.stringify({ error: "Invalid license key" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!license.is_active) {
      return new Response(
        JSON.stringify({ error: "License is inactive" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "License has expired" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (license.download_count >= license.download_limit) {
      return new Response(
        JSON.stringify({
          error: "Download limit reached",
          message: `You have reached the maximum number of downloads (${license.download_limit}) for this product.`,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const { error: logError } = await supabase
      .from("download_logs")
      .insert({
        license_id: license.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        success: true,
      });

    if (logError) {
      console.error("Failed to log download:", logError);
    }

    const { error: updateError } = await supabase
      .from("product_licenses")
      .update({
        download_count: license.download_count + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq("id", license.id);

    if (updateError) {
      console.error("Failed to update download count:", updateError);
    }

    const digitalFile = Array.isArray(license.digital_product_files)
      ? license.digital_product_files[0]
      : license.digital_product_files;

    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from("digital-products")
      .createSignedUrl(digitalFile.file_path, 300);

    if (urlError || !signedUrlData) {
      return new Response(
        JSON.stringify({ error: "Failed to generate download URL" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        download_url: signedUrlData.signedUrl,
        file_name: digitalFile.file_name,
        downloads_remaining: license.download_limit - (license.download_count + 1),
        expires_at: license.expires_at,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error processing download:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process download",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});