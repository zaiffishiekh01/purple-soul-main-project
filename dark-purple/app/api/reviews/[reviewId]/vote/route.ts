import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    const { reviewId } = params;

    const { data: existingVote } = await supabase
      .from("review_helpful_votes")
      .select("id")
      .eq("review_id", reviewId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingVote) {
      const { error } = await supabase
        .from("review_helpful_votes")
        .delete()
        .eq("id", existingVote.id);

      if (error) throw error;

      return NextResponse.json({ voted: false });
    } else {
      const { error } = await supabase
        .from("review_helpful_votes")
        .insert({
          review_id: reviewId,
          user_id: userId,
        });

      if (error) throw error;

      return NextResponse.json({ voted: true });
    }
  } catch (error: any) {
    console.error("Error voting on review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to vote on review" },
      { status: 500 }
    );
  }
}
