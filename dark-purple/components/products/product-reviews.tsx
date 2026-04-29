'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, Loader2, ImageIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ReviewMedia {
  id: string;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url?: string;
  alt_text?: string;
  display_order?: number;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  review_text: string;
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
  review_media?: ReviewMedia[];
  review_responses?: Array<{
    id: string;
    response_text: string;
    responder_type: string;
    created_at: string;
  }>;
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4' | '3' | '2' | '1' | 'with_photos'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    total: 0,
    breakdown: [0, 0, 0, 0, 0]
  });
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    review_text: ''
  });
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (productId) {
      fetchReviews();
      if (user) {
        fetchUserHelpfulVotes();
      }
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          review_media (
            id,
            media_type,
            media_url,
            thumbnail_url,
            alt_text,
            display_order
          ),
          review_responses (
            id,
            response_text,
            responder_type,
            created_at
          )
        `)
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      calculateRatingStats(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHelpfulVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('review_helpful_votes')
        .select('review_id')
        .eq('user_id', user?.id);

      if (error) throw error;

      setHelpfulVotes(new Set(data?.map(v => v.review_id) || []));
    } catch (error) {
      console.error('Error fetching helpful votes:', error);
    }
  };

  const calculateRatingStats = (reviewData: Review[]) => {
    if (reviewData.length === 0) {
      setRatingStats({ average: 0, total: 0, breakdown: [0, 0, 0, 0, 0] });
      return;
    }

    const breakdown = [0, 0, 0, 0, 0];
    let sum = 0;

    reviewData.forEach(review => {
      sum += review.rating;
      breakdown[review.rating - 1]++;
    });

    setRatingStats({
      average: sum / reviewData.length,
      total: reviewData.length,
      breakdown
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to write a review');
      return;
    }

    if (formData.title.length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }

    if (formData.review_text.length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          ...formData,
          verified_purchase: true,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this product');
        } else if (error.message.includes('WITH CHECK')) {
          toast.error('You can only review products you have purchased');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Review submitted! It will appear after approval.');
      setFormData({ rating: 5, title: '', review_text: '' });
      setDialogOpen(false);
      fetchReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleHelpful = async (reviewId: string) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    const isHelpful = helpfulVotes.has(reviewId);

    try {
      if (isHelpful) {
        const { error } = await supabase
          .from('review_helpful_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        if (error) throw error;

        setHelpfulVotes(prev => {
          const next = new Set(prev);
          next.delete(reviewId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('review_helpful_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id
          });

        if (error) throw error;

        setHelpfulVotes(prev => new Set(prev).add(reviewId));
      }

      fetchReviews();
    } catch (error: any) {
      console.error('Error toggling helpful:', error);
      toast.error(error.message || 'Failed to update vote');
    }
  };

  const getFilteredAndSortedReviews = () => {
    let filtered = reviews;

    if (filterRating !== 'all') {
      if (filterRating === 'with_photos') {
        filtered = reviews.filter(r => r.review_media && r.review_media.length > 0);
      } else {
        filtered = reviews.filter(r => r.rating === parseInt(filterRating));
      }
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'helpful':
          return b.helpful_count - a.helpful_count;
        case 'rating_high':
          return b.rating - a.rating;
        case 'rating_low':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  };

  const renderStars = (rating: number, size: string = 'w-5 h-5') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-white/20'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="ethereal-divider"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card glass-card-hover p-8">
          <div className="text-center space-y-4">
            <div className="text-5xl font-serif text-white">
              {ratingStats.average.toFixed(1)}
            </div>
            {renderStars(Math.round(ratingStats.average), 'w-6 h-6')}
            <p className="text-white/60">
              Based on {ratingStats.total} {ratingStats.total === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingStats.breakdown[rating - 1];
              const percentage = ratingStats.total > 0
                ? (count / ratingStats.total) * 100
                : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-white/70 w-12">{rating} star</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-white/70 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="w-full mt-6 celestial-button text-white">
                Write a Review
              </button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e] border-white/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white text-2xl font-serif">Write Your Review</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitReview} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="text-white/90">Rating</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating }))}
                        className="p-2 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= formData.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white/90">Review Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Summarize your experience"
                    className="bg-white/5 border-white/20 text-white"
                    required
                    minLength={3}
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review" className="text-white/90">Your Review</Label>
                  <Textarea
                    id="review"
                    value={formData.review_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, review_text: e.target.value }))}
                    placeholder="Share your thoughts about this product..."
                    rows={6}
                    className="bg-white/5 border-white/20 text-white"
                    required
                    minLength={10}
                    maxLength={5000}
                  />
                  <p className="text-xs text-white/50">
                    {formData.review_text.length} / 5000 characters
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 celestial-button text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <Card className="glass-card glass-card-hover p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: '#d4af8a' }} />
              <h3 className="text-xl font-serif text-white mb-2">No reviews yet</h3>
              <p className="text-white/60">Be the first to share your experience with this product</p>
            </Card>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="helpful">Most Helpful</SelectItem>
                    <SelectItem value="rating_high">Highest Rating</SelectItem>
                    <SelectItem value="rating_low">Lowest Rating</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterRating} onValueChange={(v: any) => setFilterRating(v)}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="with_photos">With Photos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {getFilteredAndSortedReviews().map((review) => (
              <Card key={review.id} className="glass-card glass-card-hover p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {renderStars(review.rating)}
                    <h3 className="text-lg font-semibold text-white mt-2">{review.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-white/60">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </span>
                      {review.verified_purchase && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-white/80 leading-relaxed mb-4">{review.review_text}</p>

                {review.review_media && review.review_media.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-4">
                    {review.review_media
                      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                      .map((media) => (
                        <Dialog key={media.id}>
                          <DialogTrigger asChild>
                            <button
                              className="relative group overflow-hidden rounded-lg border border-white/20 hover:border-white/40 transition-all"
                              onClick={() => setSelectedImage(media.media_url)}
                            >
                              <img
                                src={media.thumbnail_url || media.media_url}
                                alt={media.alt_text || "Review photo"}
                                className="h-20 w-20 object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl bg-black/90 border-white/20">
                            <img
                              src={media.media_url}
                              alt={media.alt_text || "Review photo"}
                              className="w-full h-auto rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                      ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => toggleHelpful(review.id)}
                    disabled={!user}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      helpfulVotes.has(review.id)
                        ? 'text-blue-400'
                        : 'text-white/60 hover:text-white/90'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${helpfulVotes.has(review.id) ? 'fill-current' : ''}`} />
                    Helpful ({review.helpful_count})
                  </button>
                </div>

                {review.review_responses && review.review_responses.length > 0 && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg border-l-2 border-blue-400/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                        {review.review_responses[0].responder_type === 'vendor' ? 'Vendor Response' : 'Admin Response'}
                      </Badge>
                      <span className="text-xs text-white/50">
                        {formatDistanceToNow(new Date(review.review_responses[0].created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {review.review_responses[0].response_text}
                    </p>
                  </div>
                )}
              </Card>
            ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
