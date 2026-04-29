"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StarRating, RatingBreakdown } from "./star-rating";
import { Star } from "lucide-react";

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    rating: number;
    count: number;
  }[];
  onWriteReview?: () => void;
  canWriteReview?: boolean;
}

export function ReviewSummary({
  averageRating,
  totalReviews,
  ratingBreakdown,
  onWriteReview,
  canWriteReview = false,
}: ReviewSummaryProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8 p-6 bg-gray-50 rounded-lg">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div>
          <div className="text-5xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="lg" />
          <p className="text-sm text-gray-600 mt-2">
            Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>
        {canWriteReview && onWriteReview && (
          <Button onClick={onWriteReview} className="gap-2">
            <Star className="h-4 w-4" />
            Write a Review
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
        <RatingBreakdown breakdown={ratingBreakdown} totalReviews={totalReviews} />
      </div>
    </div>
  );
}
