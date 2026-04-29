import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { userId, responseText, responderType } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    if (!responseText || responseText.length < 10) {
      return NextResponse.json(
        { error: "Response must be at least 10 characters" },
        { status: 400 }
      );
    }

    const { reviewId } = params;

    if (responderType === "vendor") {
      const { data: review } = await supabase
        .from("product_reviews")
        .select("product_id, products!inner(vendor_id)")
        .eq("id", reviewId)
        .maybeSingle();

      if (!review || (review.products as any).vendor_id !== userId) {
        return NextResponse.json(
          { error: "Only the vendor can respond to reviews for their products" },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase
      .from("review_responses")
      .insert({
        review_id: reviewId,
        responder_id: userId,
        responder_type: responderType,
        response_text: responseText,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, response: data });
  } catch (error: any) {
    console.error("Error creating review response:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create response" },
      { status: 500 }
    );
  }
}
