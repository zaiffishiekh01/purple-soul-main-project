import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.10.0";
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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;
        const vendorId = paymentIntent.metadata.vendorId;

        if (orderId) {
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "processing",
              stripe_payment_status: "succeeded"
            })
            .eq("id", orderId);

          await supabase
            .from("stripe_payment_intents")
            .update({
              status: "succeeded",
              transfer_status: "pending"
            })
            .eq("stripe_payment_intent_id", paymentIntent.id);

          if (vendorId) {
            await supabase.from("transactions").insert({
              vendor_id: vendorId,
              order_id: orderId,
              type: "sale",
              amount: paymentIntent.amount / 100,
              status: "completed",
              payment_method: "stripe",
              reference_id: paymentIntent.id,
            });

            await supabase.from("notifications").insert({
              vendor_id: vendorId,
              type: "order",
              title: "New Order Paid",
              message: `A new order has been paid via Stripe. Amount: $${(paymentIntent.amount / 100).toFixed(2)}`,
              is_read: false,
            });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await supabase
            .from("orders")
            .update({
              payment_status: "failed",
              status: "cancelled",
              stripe_payment_status: "failed"
            })
            .eq("id", orderId);

          await supabase
            .from("stripe_payment_intents")
            .update({ status: "failed" })
            .eq("stripe_payment_intent_id", paymentIntent.id);
        }
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        const payoutRequestId = transfer.metadata?.payoutRequestId;
        const vendorId = transfer.metadata?.vendorId;

        if (vendorId) {
          await supabase
            .from("stripe_transfers")
            .update({
              status: "created",
              destination_payment: transfer.destination_payment as string
            })
            .eq("stripe_transfer_id", transfer.id);
        }
        break;
      }

      case "transfer.paid": {
        const transfer = event.data.object as Stripe.Transfer;
        const payoutRequestId = transfer.metadata?.payoutRequestId;

        if (payoutRequestId) {
          await supabase
            .from("stripe_transfers")
            .update({ status: "paid" })
            .eq("stripe_transfer_id", transfer.id);

          await supabase
            .from("payout_requests")
            .update({
              status: "completed",
              transfer_completed_date: new Date().toISOString()
            })
            .eq("id", payoutRequestId);
        }
        break;
      }

      case "transfer.failed": {
        const transfer = event.data.object as Stripe.Transfer;
        const payoutRequestId = transfer.metadata?.payoutRequestId;

        if (payoutRequestId) {
          await supabase
            .from("stripe_transfers")
            .update({
              status: "failed",
              failure_code: (transfer as any).failure_code,
              failure_message: (transfer as any).failure_message
            })
            .eq("stripe_transfer_id", transfer.id);

          await supabase
            .from("payout_requests")
            .update({
              status: "failed",
              failure_reason: (transfer as any).failure_message || "Transfer failed"
            })
            .eq("id", payoutRequestId);
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const vendorIdMatch = account.metadata?.vendorId;

        if (vendorIdMatch) {
          await supabase
            .from("vendors")
            .update({
              stripe_charges_enabled: account.charges_enabled,
              stripe_payouts_enabled: account.payouts_enabled,
              stripe_details_submitted: account.details_submitted,
              stripe_onboarding_completed: account.details_submitted && account.charges_enabled,
              stripe_account_status: account.details_submitted && account.charges_enabled ? "active" : "pending"
            })
            .eq("stripe_account_id", account.id);

          await supabase
            .from("stripe_connected_accounts")
            .update({
              charges_enabled: account.charges_enabled,
              payouts_enabled: account.payouts_enabled,
              details_submitted: account.details_submitted,
              onboarding_completed: account.details_submitted && account.charges_enabled,
              requirements: account.requirements,
              capabilities: account.capabilities,
              updated_at: new Date().toISOString()
            })
            .eq("stripe_account_id", account.id);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent;

        if (paymentIntentId) {
          const { data: paymentIntent } = await supabase
            .from("stripe_payment_intents")
            .select("order_id, vendor_id, amount")
            .eq("stripe_payment_intent_id", paymentIntentId)
            .single();

          if (paymentIntent) {
            await supabase.from("transactions").insert({
              vendor_id: paymentIntent.vendor_id,
              order_id: paymentIntent.order_id,
              type: "refund",
              amount: charge.amount_refunded / 100,
              status: "completed",
              payment_method: "stripe",
              reference_id: charge.id,
            });

            await supabase
              .from("orders")
              .update({ payment_status: "refunded" })
              .eq("id", paymentIntent.order_id);

            await supabase.from("notifications").insert({
              vendor_id: paymentIntent.vendor_id,
              type: "payment",
              title: "Payment Refunded",
              message: `A payment of $${(charge.amount_refunded / 100).toFixed(2)} has been refunded.`,
              is_read: false,
            });
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Webhook handler failed" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});