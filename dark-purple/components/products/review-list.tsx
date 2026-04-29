"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "./star-rating";
import { ThumbsUp, ThumbsDown, CheckCircle2, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ReviewMedia {
  id: string;
  media_type: "image" | "video";
  media_url: string;
  thumbnail_url?: string;
  alt_text?: string;
}

interface ReviewResponse {
  id: string;
  responder_type: "vendor" | "admin";
  response_text: string;
  created_at: string;
  responder_name?: string;
}

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
  media?: ReviewMedia[];
  responses?: ReviewResponse[];
  user_voted?: boolean;
}

interface ReviewListProps {
  reviews: Review[];
  onVoteHelpful: (reviewId: string, currentlyVoted: boolean) => Promise<void>;
  currentUserId?: string;
}

type SortOption = "most_recent" | "highest_rating" | "lowest_rating" | "most_helpful";
type FilterOption = "all" | "5" | "4" | "3" | "2" | "1" | "with_photos";

export function ReviewList({ reviews, onVoteHelpful, currentUserId }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("most_recent");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [votingReview, setVotingReview] = useState<string | null>(null);

  const filteredAndSortedReviews = reviews
    .filter((review) => {
      if (filterBy === "all") return true;
      if (filterBy === "with_photos") return (review.media?.length || 0) > 0;
      return review.rating === parseInt(filterBy);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "most_recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "highest_rating":
          return b.rating - a.rating;
        case "lowest_rating":
          return a.rating - b.rating;
        case "most_helpful":
          return b.helpful_count - a.helpful_count;
        default:
          return 0;
      }
    });

  const handleVote = async (reviewId: string, currentlyVoted: boolean) => {
    setVotingReview(reviewId);
    try {
      await onVoteHelpful(reviewId, currentlyVoted);
    } finally {
      setVotingReview(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="most_recent">Most Recent</SelectItem>
            <SelectItem value="most_helpful">Most Helpful</SelectItem>
            <SelectItem value="highest_rating">Highest Rating</SelectItem>
            <SelectItem value="lowest_rating">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
            <SelectItem value="with_photos">With Photos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAndSortedReviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No reviews match your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAndSortedReviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              onVoteHelpful={handleVote}
              isVoting={votingReview === review.id}
              canVote={!!currentUserId && currentUserId !== review.user_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReviewItemProps {
  review: Review;
  onVoteHelpful: (reviewId: string, currentlyVoted: boolean) => void;
  isVoting: boolean;
  canVote: boolean;
}

function ReviewItem({ review, onVoteHelpful, isVoting, canVote }: ReviewItemProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="border-b pb-6 last:border-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-amber-100 text-amber-900">
            {review.user_name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">
              {review.user_name || "Anonymous"}
            </span>
            {review.verified_purchase && (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                Verified Purchase
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-sm font-semibold text-gray-900">
              {review.title}
            </span>
          </div>

          <p className="text-sm text-gray-600">
            {format(new Date(review.created_at), "MMMM d, yyyy")}
          </p>

          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {review.review_text}
          </p>

          {review.media && review.media.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {review.media.map((media) => (
                <Dialog key={media.id}>
                  <DialogTrigger asChild>
                    <button
                      className="relative group overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      onClick={() => setSelectedImage(media.media_url)}
                    >
                      <img
                        src={media.thumbnail_url || media.media_url}
                        alt={media.alt_text || "Review photo"}
                        className="h-20 w-20 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <img
                      src={media.media_url}
                      alt={media.alt_text || "Review photo"}
                      className="w-full h-auto"
                    />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVoteHelpful(review.id, review.user_voted || false)}
              disabled={!canVote || isVoting}
              className={cn(
                "gap-2",
                review.user_voted && "text-amber-600"
              )}
            >
              <ThumbsUp className={cn("h-4 w-4", review.user_voted && "fill-current")} />
              Helpful ({review.helpful_count})
            </Button>
          </div>

          {review.responses && review.responses.length > 0 && (
            <div className="mt-4 space-y-3">
              {review.responses.map((response) => (
                <div
                  key={response.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {response.responder_type === "vendor" ? "Vendor Response" : "Admin Response"}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {format(new Date(response.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {response.response_text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
