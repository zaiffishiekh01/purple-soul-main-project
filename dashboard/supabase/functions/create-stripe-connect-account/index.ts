import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.10.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { vendorId, businessName, email, country = "US", returnUrl, refreshUrl } = await req.json();

    if (!vendorId || !businessName || !email) {
      return new Response(
        JSON.stringify({ error: "vendorId, businessName, and email are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("*")
      .eq("id", vendorId)
      .single();

    if (vendorError || !vendor) {
      throw new Error("Vendor not found");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    let account;

    if (vendor.stripe_account_id) {
      account = await stripe.accounts.retrieve(vendor.stripe_account_id);
    } else {
      account = await stripe.accounts.create({
        type: "express",
        country: country,
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "company",
        company: {
          name: businessName,
        },
        metadata: {
          vendorId: vendorId,
        },
      });

      await supabase
        .from("vendors")
        .update({
          stripe_account_id: account.id,
          stripe_account_status: "pending",
          stripe_account_type: "express",
        })
        .eq("id", vendorId);

      await supabase
        .from("stripe_connected_accounts")
        .insert({
          vendor_id: vendorId,
          stripe_account_id: account.id,
          account_type: "express",
          country: country,
          currency: "usd",
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          onboarding_completed: account.details_submitted,
          requirements: account.requirements,
          capabilities: account.capabilities,
        });
    }

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl || `${req.headers.get("origin")}/vendor/profile?stripe_refresh=true`,
      return_url: returnUrl || `${req.headers.get("origin")}/vendor/profile?stripe_connected=true`,
      type: "account_onboarding",
    });

    return new Response(
      JSON.stringify({
        accountId: account.id,
        onboardingUrl: accountLink.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error creating Stripe Connect account:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create Stripe Connect account" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
