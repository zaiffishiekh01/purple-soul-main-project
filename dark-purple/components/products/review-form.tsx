'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  userId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, userId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (title.length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }

    if (reviewText.length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      const { data: orderData } = await supabase
        .from('order_items')
        .select('order_id, orders!inner(id, customer_id, status)')
        .eq('product_id', productId)
        .eq('orders.customer_id', userId)
        .eq('orders.status', 'delivered')
        .limit(1)
        .maybeSingle();

      const verifiedPurchase = !!orderData;

      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: userId,
          order_id: orderData?.order_id || null,
          rating,
          title,
          review_text: reviewText,
          verified_purchase: verifiedPurchase,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this product');
        } else {
          throw error;
        }
        return;
      }

      setSubmitted(true);
      toast.success('Review submitted for approval');

      setTimeout(() => {
        setRating(0);
        setTitle('');
        setReviewText('');
        setSubmitted(false);
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-500/20">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-serif text-white mb-2">Thank you for your review!</h3>
        <p className="text-white/60">
          Your review has been submitted and is pending approval. It will be visible once approved by our team.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-white/90 text-base">Your Rating *</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-[#d4af8a] text-[#d4af8a]'
                    : 'fill-none text-white/30'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-white/60">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-white/90 text-base">
          Review Title *
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience in one line"
          maxLength={200}
          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12"
        />
        <p className="text-sm text-white/50">
          {title.length}/200 characters (minimum 3)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review" className="text-white/90 text-base">
          Your Review *
        </Label>
        <Textarea
          id="review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this product. What did you like or dislike?"
          maxLength={5000}
          rows={6}
          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
        />
        <p className="text-sm text-white/50">
          {reviewText.length}/5000 characters (minimum 10)
        </p>
      </div>

      <div className="glass-card p-4 rounded-lg">
        <p className="text-sm text-white/70 leading-relaxed">
          By submitting this review, you confirm that it represents your own experience and honest opinion of this product.
          Reviews are subject to approval and may be edited for clarity.
        </p>
      </div>

      <Button
        type="submit"
        disabled={submitting || rating === 0 || title.length < 3 || reviewText.length < 10}
        className="celestial-button text-white w-full"
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
    </form>
  );
}
