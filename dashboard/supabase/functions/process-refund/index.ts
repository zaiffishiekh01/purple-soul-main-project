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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({
          error: "Stripe not configured",
          message: "Payment provider is not configured. Please configure Stripe to process refunds.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { returnId, refundAmount, refundMethod, notes } = await req.json();

    if (!returnId || !refundAmount) {
      return new Response(
        JSON.stringify({ error: "Return ID and refund amount are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: returnData, error: returnError } = await supabase
      .from("returns")
      .select(`
        *,
        orders!inner(
          id,
          order_number,
          payment_intent_id,
          total_amount
        )
      `)
      .eq("id", returnId)
      .single();

    if (returnError || !returnData) {
      return new Response(
        JSON.stringify({ error: "Return not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (returnData.status !== "received") {
      return new Response(
        JSON.stringify({
          error: "Invalid return status",
          message: "Return must be in 'received' status to process refund",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let refundId = null;
    let refundStatus = "completed";

    if (refundMethod === "original_payment" && returnData.orders.payment_intent_id) {
      try {
        const refundResponse = await fetch(
          "https://api.stripe.com/v1/refunds",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${stripeSecretKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              payment_intent: returnData.orders.payment_intent_id,
              amount: Math.round(refundAmount * 100).toString(),
              reason: "requested_by_customer",
              metadata: JSON.stringify({
                return_id: returnId,
                return_number: returnData.return_number,
                order_number: returnData.orders.order_number,
              }),
            }),
          }
        );

        if (!refundResponse.ok) {
          const error = await refundResponse.json();
          throw new Error(error.error?.message || "Stripe refund failed");
        }

        const refundResult = await refundResponse.json();
        refundId = refundResult.id;
        refundStatus = refundResult.status === "succeeded" ? "completed" : "pending";
      } catch (stripeError: any) {
        console.error("Stripe refund error:", stripeError);
        return new Response(
          JSON.stringify({
            error: "Refund processing failed",
            message: stripeError.message || "Failed to process refund with Stripe",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const now = new Date().toISOString();

    const { data: updatedReturn, error: updateError } = await supabase
      .from("returns")
      .update({
        status: "completed",
        refund_method: refundMethod,
        return_amount: refundAmount,
        refunded_at: now,
        processed_at: now,
        notes: notes || returnData.notes,
        refund_transaction_id: refundId,
      })
      .eq("id", returnId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        vendor_id: returnData.vendor_id,
        order_id: returnData.order_id,
        type: "refund",
        amount: -refundAmount,
        status: refundStatus,
        description: `Refund for return ${returnData.return_number} - ${returnData.reason}`,
        metadata: {
          return_id: returnId,
          refund_method: refundMethod,
          stripe_refund_id: refundId,
        },
      });

    if (transactionError) {
      console.error("Transaction error:", transactionError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        return: updatedReturn,
        refund_id: refundId,
        refund_status: refundStatus,
        message: refundMethod === "original_payment"
          ? "Refund processed successfully via Stripe"
          : "Refund recorded successfully. Manual payment required.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error processing refund:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process refund",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});