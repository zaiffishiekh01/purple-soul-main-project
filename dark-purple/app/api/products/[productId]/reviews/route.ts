import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const { data: reviews, error } = await supabase
      .from("product_reviews")
      .select(`
        *,
        review_media (*),
        review_responses (*)
      `)
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (userId) {
      const { data: votes } = await supabase
        .from("review_helpful_votes")
        .select("review_id")
        .eq("user_id", userId)
        .in("review_id", reviews?.map((r) => r.id) || []);

      const votedReviewIds = new Set(votes?.map((v) => v.review_id) || []);

      const reviewsWithVotes = reviews?.map((review) => ({
        ...review,
        user_voted: votedReviewIds.has(review.id),
      }));

      return NextResponse.json({ reviews: reviewsWithVotes || [] });
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const { userId, rating, title, reviewText, orderId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!title || title.length < 3) {
      return NextResponse.json(
        { error: "Title must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!reviewText || reviewText.length < 10) {
      return NextResponse.json(
        { error: "Review must be at least 10 characters" },
        { status: 400 }
      );
    }

    const { data: orderData } = await supabase
      .from("order_items")
      .select("order_id, orders!inner(id, customer_id, status)")
      .eq("product_id", productId)
      .eq("orders.customer_id", userId)
      .eq("orders.status", "delivered")
      .limit(1)
      .maybeSingle();

    const verifiedPurchase = !!orderData;

    const { data, error } = await supabase
      .from("product_reviews")
      .insert({
        product_id: productId,
        user_id: userId,
        order_id: orderId || orderData?.order_id || null,
        rating,
        title,
        review_text: reviewText,
        verified_purchase: verifiedPurchase,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You have already reviewed this product" },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, review: data });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}
