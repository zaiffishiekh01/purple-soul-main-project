"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReviewSummary } from "./review-summary";
import { ReviewList } from "./review-list";
import { ReviewForm } from "./review-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  user_id: string;
  user_name?: string;
  rating: number;
  title: string;
  review_text: string;
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
  media?: any[];
  responses?: any[];
  user_voted?: boolean;
}

interface ProductReviewsSectionProps {
  productId: string;
  userId?: string;
  canWriteReview?: boolean;
}

export function ProductReviewsSection({
  productId,
  userId,
  canWriteReview = false,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId, userId]);

  const fetchReviews = async () => {
    try {
      const url = userId
        ? `/api/products/${productId}/reviews?userId=${userId}`
        : `/api/products/${productId}/reviews`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteHelpful = async (reviewId: string, currentlyVoted: boolean) => {
    if (!userId) {
      toast.error("Please sign in to vote on reviews");
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  helpful_count: currentlyVoted
                    ? review.helpful_count - 1
                    : review.helpful_count + 1,
                  user_voted: data.voted,
                }
              : review
          )
        );
        toast.success(data.voted ? "Marked as helpful" : "Removed helpful vote");
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error voting on review:", error);
      toast.error("Failed to vote on review");
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const getRatingBreakdown = () => {
    const breakdown = [
      { rating: 5, count: 0 },
      { rating: 4, count: 0 },
      { rating: 3, count: 0 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ];

    reviews.forEach((review) => {
      const item = breakdown.find((b) => b.rating === review.rating);
      if (item) item.count++;
    });

    return breakdown;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const averageRating = calculateAverageRating();
  const ratingBreakdown = getRatingBreakdown();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        <ReviewSummary
          averageRating={averageRating}
          totalReviews={reviews.length}
          ratingBreakdown={ratingBreakdown}
          onWriteReview={() => setShowReviewForm(true)}
          canWriteReview={canWriteReview}
        />
      </div>

      {reviews.length > 0 ? (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            All Reviews ({reviews.length})
          </h3>
          <ReviewList
            reviews={reviews}
            onVoteHelpful={handleVoteHelpful}
            currentUserId={userId}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No reviews yet</p>
          {canWriteReview && (
            <Button onClick={() => setShowReviewForm(true)}>
              Be the first to review
            </Button>
          )}
        </div>
      )}

      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          {userId && (
            <ReviewForm
              productId={productId}
              userId={userId}
              onSuccess={() => {
                setShowReviewForm(false);
                fetchReviews();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
