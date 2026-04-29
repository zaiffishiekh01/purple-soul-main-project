'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Check, X, Search, MessageSquare, Loader2, Eye, CheckCircle2, XCircle, Clock, ImageIcon } from 'lucide-react';
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
  user_id: string;
  users?: {
    full_name: string;
    email: string;
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
  }>;
}

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('product_reviews')
        .select(`
          *,
          users (
            full_name,
            email
          ),
          products (
            title,
            images
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
            responder_type
          )
        `)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success(`Review ${newStatus}`);
      fetchReviews();
    } catch (error: any) {
      console.error('Error updating review status:', error);
      toast.error(error.message || 'Failed to update review status');
    }
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
          responder_type: 'admin',
          response_text: responseText,
        });

      if (error) throw error;

      toast.success('Response posted');
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

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      review.title?.toLowerCase().includes(search) ||
      review.review_text?.toLowerCase().includes(search) ||
      review.products?.title?.toLowerCase().includes(search) ||
      review.users?.full_name?.toLowerCase().includes(search)
    );
  });

  const stats = {
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif text-white mb-2">Review Moderation</h1>
        <p className="text-white/60 text-lg">
          Approve, reject, and respond to product reviews
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Pending Reviews</p>
              <p className="text-3xl font-serif text-white">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>

        <Card className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Approved</p>
              <p className="text-3xl font-serif text-white">{stats.approved}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="glass-card glass-card-hover p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Rejected</p>
              <p className="text-3xl font-serif text-white">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </Card>
      </div>

      <Card className="glass-card glass-card-hover p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            placeholder="Search reviews by title, content, product, or reviewer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12"
          />
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-white/10 text-white"
          >
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="data-[state=active]:bg-white/10 text-white"
          >
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-white/10 text-white"
          >
            Rejected ({stats.rejected})
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white/10 text-white"
          >
            All ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <Card className="glass-card p-12">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
              </div>
            </Card>
          ) : filteredReviews.length === 0 ? (
            <Card className="glass-card p-12">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: '#d4af8a' }} />
                <h3 className="text-xl font-serif text-white mb-2">
                  No {activeTab !== 'all' ? activeTab : ''} reviews found
                </h3>
                <p className="text-white/60">
                  {searchQuery ? 'Try a different search term' : 'Check back later for new reviews'}
                </p>
              </div>
            </Card>
          ) : (
            filteredReviews.map((review) => (
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                          <Badge
                            className={
                              review.status === 'approved'
                                ? 'bg-green-500/20 text-green-200 border-green-500/30'
                                : review.status === 'rejected'
                                ? 'bg-red-500/20 text-red-200 border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30'
                            }
                          >
                            {review.status}
                          </Badge>
                          {review.verified_purchase && (
                            <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-1">{review.title}</h3>

                        <p className="text-sm text-white/60 mb-3">
                          by {review.users?.full_name || 'Anonymous'} •{' '}
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </p>

                        <p className="text-white/80 mb-2 line-clamp-3">{review.review_text}</p>

                        {review.review_media && review.review_media.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {review.review_media
                              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                              .slice(0, 3)
                              .map((media) => (
                                <div key={media.id} className="relative group">
                                  <img
                                    src={media.thumbnail_url || media.media_url}
                                    alt="Review media"
                                    className="w-16 h-16 object-cover rounded border border-white/20"
                                  />
                                  {review.review_media && review.review_media.length > 3 && (
                                    <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center text-white text-xs">
                                      +{review.review_media.length - 3}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}

                        <p className="text-sm text-white/50">
                          Product: {review.products?.title}
                        </p>
                      </div>
                    </div>

                    {review.review_responses && review.review_responses.length > 0 && (
                      <div className="pl-4 border-l-2 border-blue-500/30 bg-blue-500/5 rounded p-3">
                        <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 mb-2">
                          {review.review_responses[0].responder_type === 'admin' ? 'Admin Response' : 'Vendor Response'}
                        </Badge>
                        <p className="text-white/70 text-sm">{review.review_responses[0].response_text}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      {review.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(review.id, 'approved')}
                            className="bg-green-500/20 text-green-200 border-green-500/30 hover:bg-green-500/30"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(review.id, 'rejected')}
                            className="bg-red-500/20 text-red-200 border-red-500/30 hover:bg-red-500/30"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}

                      {review.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(review.id, 'rejected')}
                          className="bg-red-500/20 text-red-200 border-red-500/30 hover:bg-red-500/30"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      )}

                      {review.status === 'rejected' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(review.id, 'approved')}
                          className="bg-green-500/20 text-green-200 border-green-500/30 hover:bg-green-500/30"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      )}

                      {!review.review_responses?.some((r) => r.responder_type === 'admin') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReview(review)}
                          className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Respond
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedReview}
        onOpenChange={(open) => !open && setSelectedReview(null)}
      >
        <DialogContent className="bg-[#1a1625]/95 border border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Respond to Review</DialogTitle>
            <DialogDescription className="text-white/60">
              Post an official admin response to this review
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
                <p className="text-white/70 text-sm">{selectedReview.review_text}</p>
              </div>

              <div className="space-y-2">
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your official response..."
                  maxLength={2000}
                  rows={6}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
                <p className="text-sm text-white/50">
                  {responseText.length}/2000 characters (minimum 10)
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
