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

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const {
      amount,
      currency = "usd",
      orderId,
      vendorId,
      platformFee,
      customerEmail,
      customerId
    } = await req.json();

    if (!amount || !orderId || !vendorId) {
      return new Response(
        JSON.stringify({ error: "Amount, orderId, and vendorId are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("stripe_account_id, stripe_charges_enabled")
      .eq("id", vendorId)
      .single();

    if (vendorError || !vendor) {
      throw new Error("Vendor not found");
    }

    if (!vendor.stripe_account_id || !vendor.stripe_charges_enabled) {
      throw new Error("Vendor has not completed Stripe Connect onboarding");
    }

    const applicationFeeAmount = platformFee ? Math.round(platformFee * 100) : Math.round(amount * 0.10 * 100);
    const vendorAmount = amount - (applicationFeeAmount / 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: vendor.stripe_account_id,
      },
      metadata: {
        orderId,
        vendorId,
        platformFee: (applicationFeeAmount / 100).toString(),
        vendorAmount: vendorAmount.toString(),
      },
      receipt_email: customerEmail,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await supabase
      .from("stripe_payment_intents")
      .insert({
        order_id: orderId,
        vendor_id: vendorId,
        customer_id: customerId || null,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id: null,
        amount: amount,
        platform_fee: applicationFeeAmount / 100,
        vendor_amount: vendorAmount,
        currency: currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
      });

    await supabase
      .from("orders")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_status: paymentIntent.status,
      })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        platformFee: applicationFeeAmount / 100,
        vendorAmount: vendorAmount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create payment intent" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
