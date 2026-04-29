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

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const { payoutRequestId, vendorId, amount, currency = "usd" } = await req.json();

    if (!payoutRequestId || !vendorId || !amount) {
      return new Response(
        JSON.stringify({ error: "payoutRequestId, vendorId, and amount are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("stripe_account_id, stripe_payouts_enabled, business_name")
      .eq("id", vendorId)
      .single();

    if (vendorError || !vendor) {
      throw new Error("Vendor not found");
    }

    if (!vendor.stripe_account_id) {
      throw new Error("Vendor has not connected a Stripe account");
    }

    if (!vendor.stripe_payouts_enabled) {
      throw new Error("Vendor's Stripe account does not have payouts enabled");
    }

    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: currency,
      destination: vendor.stripe_account_id,
      description: `Payout to ${vendor.business_name}`,
      metadata: {
        payoutRequestId: payoutRequestId,
        vendorId: vendorId,
      },
    });

    await supabase
      .from("stripe_transfers")
      .insert({
        vendor_id: vendorId,
        payout_request_id: payoutRequestId,
        stripe_transfer_id: transfer.id,
        stripe_account_id: vendor.stripe_account_id,
        amount: amount,
        currency: currency,
        status: transfer.object === "transfer" ? "succeeded" : "pending",
        source_transaction: transfer.source_transaction as string,
        destination_payment: transfer.destination_payment as string,
        metadata: transfer.metadata,
      });

    await supabase
      .from("payout_requests")
      .update({
        status: "completed",
        stripe_transfer_id: transfer.id,
        transfer_completed_date: new Date().toISOString(),
        auto_payout_enabled: true,
      })
      .eq("id", payoutRequestId);

    const transactionId = `PAYOUT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await supabase
      .from("transactions")
      .insert({
        vendor_id: vendorId,
        type: "payout",
        amount: amount,
        status: "completed",
        description: `Automatic payout via Stripe - Transfer ID: ${transfer.id}`,
        reference_id: transactionId,
      });

    await supabase.from("notifications").insert({
      vendor_id: vendorId,
      type: "payment",
      title: "Automatic Payout Completed",
      message: `Your payout of $${amount.toFixed(2)} has been automatically transferred to your Stripe account. Transfer ID: ${transfer.id}`,
      is_read: false,
    });

    return new Response(
      JSON.stringify({
        success: true,
        transferId: transfer.id,
        amount: amount,
        status: "completed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error creating automatic payout:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create automatic payout" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
