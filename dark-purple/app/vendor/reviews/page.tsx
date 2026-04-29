'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, MessageSquare, Loader2, CheckCircle2, TrendingUp, TrendingDown, ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';

interface Review {
  id: string;
  rating: number;
  title: string;
  review_text: string;
  helpful_count: number;
  verified_purchase: boolean;
  status: string;
  created_at: string;
  product_id: string;
  users?: {
    full_name: string;
  };
  products?: {
    title: string;
    images: string[];
  };
  review_media?: Array<{
    id: string;
    media_type: string;
    media_url: string;
    thumbnail_url?: string;
    display_order?: number;
  }>;
  review_responses?: Array<{
    id: string;
    response_text: string;
    responder_type: string;
    created_at: string;
  }>;
}

export default function VendorReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    needsResponse: 0,
    breakdown: [0, 0, 0, 0, 0],
  });

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          users (
            full_name
          ),
          products!inner (
            title,
            images,
            vendor_id
          ),
          review_media (
            id,
            media_type,
            media_url,
            thumbnail_url,
            display_order
          ),
          review_responses (
            id,
            response_text,
            responder_type,
            created_at
          )
        `)
        .eq('products.vendor_id', user?.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviewData = data || [];
      setReviews(reviewData);
      calculateStats(reviewData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewData: Review[]) => {
    if (reviewData.length === 0) {
      setStats({ average: 0, total: 0, needsResponse: 0, breakdown: [0, 0, 0, 0, 0] });
      return;
    }

    const breakdown = [0, 0, 0, 0, 0];
    let sum = 0;
    let needsResponse = 0;

    reviewData.forEach((review) => {
      sum += review.rating;
      breakdown[review.rating - 1]++;

      const hasVendorResponse = review.review_responses?.some(
        (r) => r.responder_type === 'vendor'
      );
      if (!hasVendorResponse) {
        needsResponse++;
      }
    });

    setStats({
      average: sum / reviewData.length,
      total: reviewData.length,
      needsResponse,
      breakdown,
    });
  };

  const handlePostResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    if (responseText.length < 10) {
      toast.error('Response must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('review_responses')
        .insert({
          review_id: selectedReview.id,
          responder_id: user?.id,
          responder_type: 'vendor',
          response_text: responseText,
        });

      if (error) throw error;

      toast.success('Response posted successfully');
      setSelectedReview(null);
      setResponseText('');
      fetchReviews();
    } catch (error: any) {
      console.error('Error posting response:', error);
      toast.error(error.message || 'Failed to post response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif text-white mb-2">Product Reviews</h1>
        <p className="text-white/60 text-lg">
          View and respond to customer reviews for your products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-sm">Average Rating</p>
            <Star className="w-5 h-5" style={{ color: '#d4af8a' }} />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-serif text-white">{stats.average.toFixed(1)}</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(stats.average)
                      ? 'fill-[#d4af8a] text-[#d4af8a]'
                      : 'fill-none text-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>

        <Card className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-sm">Total Reviews</p>
            <MessageSquare className="w-5 h-5" style={{ color: '#d4af8a' }} />
          </div>
          <p className="text-4xl font-serif text-white">{stats.total}</p>
        </Card>

        <Card className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-sm">Needs Response</p>
            <CheckCircle2 className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-4xl font-serif text-white">{stats.needsResponse}</p>
        </Card>

        <Card className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-sm">5-Star Reviews</p>
            {stats.breakdown[4] > stats.breakdown[0] ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <p className="text-4xl font-serif text-white">{stats.breakdown[4]}</p>
        </Card>
      </div>

      <Card className="glass-card glass-card-hover p-8">
        <h2 className="text-2xl font-serif text-white mb-6">Rating Distribution</h2>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.breakdown[rating - 1];
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-4">
                <span className="text-white/70 w-16">{rating} star</span>
                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      background: 'linear-gradient(90deg, #d4af8a 0%, #b8a0dc 100%)',
                    }}
                  />
                </div>
                <span className="text-white/70 w-12 text-right">{count}</span>
                <span className="text-white/50 w-16 text-right text-sm">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-serif text-white">Recent Reviews</h2>

        {loading ? (
          <Card className="glass-card p-12">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            </div>
          </Card>
        ) : reviews.length === 0 ? (
          <Card className="glass-card p-12">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: '#d4af8a' }} />
              <h3 className="text-xl font-serif text-white mb-2">No reviews yet</h3>
              <p className="text-white/60">
                Customer reviews will appear here once they're approved
              </p>
            </div>
          </Card>
        ) : (
          reviews.map((review) => {
            const hasVendorResponse = review.review_responses?.some(
              (r) => r.responder_type === 'vendor'
            );

            return (
              <Card key={review.id} className="glass-card glass-card-hover p-6">
                <div className="flex gap-6">
                  {review.products?.images?.[0] && (
                    <img
                      src={review.products.images[0]}
                      alt={review.products.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'fill-[#d4af8a] text-[#d4af8a]'
                                  : 'fill-none text-white/30'
                              }`}
                            />
                          ))}
                        </div>
                        {review.verified_purchase && (
                          <Badge className="bg-green-500/20 text-green-200 border-green-500/30 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                        {!hasVendorResponse && (
                          <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30 text-xs">
                            Needs Response
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-1">{review.title}</h3>

                      <p className="text-sm text-white/60 mb-3">
                        by {review.users?.full_name || 'Anonymous'} •{' '}
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })} •{' '}
                        {review.products?.title}
                      </p>

                      <p className="text-white/80">{review.review_text}</p>

                      {review.review_media && review.review_media.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-3">
                          {review.review_media
                            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                            .map((media) => (
                              <div key={media.id} className="relative group">
                                <img
                                  src={media.thumbnail_url || media.media_url}
                                  alt="Review media"
                                  className="w-16 h-16 object-cover rounded border border-white/20"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded transition-colors flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {review.review_responses && review.review_responses.length > 0 && (
                      <div className="space-y-2">
                        {review.review_responses.map((response) => (
                          <div
                            key={response.id}
                            className="pl-4 border-l-2 border-purple-500/30 bg-purple-500/5 rounded p-3"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30 text-xs">
                                {response.responder_type === 'vendor' ? 'Your Response' : 'Admin Response'}
                              </Badge>
                              <span className="text-xs text-white/50">
                                {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-white/70 text-sm">{response.response_text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {!hasVendorResponse && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedReview(review)}
                          className="celestial-button text-white"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Respond to Review
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Dialog
        open={!!selectedReview}
        onOpenChange={(open) => !open && setSelectedReview(null)}
      >
        <DialogContent className="bg-[#1a1625]/95 border border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Respond to Review</DialogTitle>
            <DialogDescription className="text-white/60">
              Post a response to this customer review
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <div className="glass-card p-4">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= selectedReview.rating
                          ? 'fill-[#d4af8a] text-[#d4af8a]'
                          : 'fill-none text-white/30'
                      }`}
                    />
                  ))}
                </div>
                <h4 className="text-white font-semibold mb-2">{selectedReview.title}</h4>
                <p className="text-white/70 text-sm mb-2">{selectedReview.review_text}</p>
                <p className="text-white/50 text-xs">
                  Product: {selectedReview.products?.title}
                </p>
              </div>

              <div className="space-y-2">
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Thank the customer and address any concerns they mentioned..."
                  maxLength={2000}
                  rows={6}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
                <p className="text-sm text-white/50">
                  {responseText.length}/2000 characters (minimum 10)
                </p>
              </div>

              <div className="glass-card p-3">
                <p className="text-sm text-white/60">
                  <strong>Tip:</strong> Keep responses professional, acknowledge the feedback,
                  and offer solutions when appropriate. Your response will be visible to all customers.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedReview(null);
                    setResponseText('');
                  }}
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePostResponse}
                  disabled={submitting || responseText.length < 10}
                  className="celestial-button text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Post Response
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
