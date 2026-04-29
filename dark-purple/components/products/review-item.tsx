'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, CheckCircle2, MessageSquare, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ReviewResponse {
  id: string;
  responder_type: string;
  response_text: string;
  created_at: string;
  users?: {
    full_name: string;
  };
}

interface Review {
  id: string;
  rating: number;
  title: string;
  review_text: string;
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
  users?: {
    full_name: string;
  };
  review_responses?: ReviewResponse[];
}

interface ReviewItemProps {
  review: Review;
  userId?: string;
  userRole?: 'vendor' | 'admin' | 'customer';
  productVendorId?: string;
  onVoteChange?: () => void;
  onResponseAdded?: () => void;
}

export function ReviewItem({
  review,
  userId,
  userRole,
  productVendorId,
  onVoteChange,
  onResponseAdded,
}: ReviewItemProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const checkIfVoted = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('review_helpful_votes')
      .select('id')
      .eq('review_id', review.id)
      .eq('user_id', userId)
      .maybeSingle();

    setHasVoted(!!data);
  };

  useState(() => {
    checkIfVoted();
  });

  const handleVote = async () => {
    if (!userId) {
      toast.error('Please sign in to vote');
      return;
    }

    setVoting(true);
    try {
      if (hasVoted) {
        const { error } = await supabase
          .from('review_helpful_votes')
          .delete()
          .eq('review_id', review.id)
          .eq('user_id', userId);

        if (error) throw error;
        setHasVoted(false);
        toast.success('Vote removed');
      } else {
        const { error } = await supabase
          .from('review_helpful_votes')
          .insert({
            review_id: review.id,
            user_id: userId,
          });

        if (error) throw error;
        setHasVoted(true);
        toast.success('Marked as helpful');
      }
      onVoteChange?.();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!userId || !responseText.trim()) return;

    if (responseText.length < 10) {
      toast.error('Response must be at least 10 characters');
      return;
    }

    setSubmittingResponse(true);
    try {
      const { error } = await supabase
        .from('review_responses')
        .insert({
          review_id: review.id,
          responder_id: userId,
          responder_type: userRole === 'admin' ? 'admin' : 'vendor',
          response_text: responseText,
        });

      if (error) throw error;

      toast.success('Response posted');
      setResponseText('');
      setShowResponseForm(false);
      onResponseAdded?.();
    } catch (error: any) {
      console.error('Error posting response:', error);
      toast.error(error.message || 'Failed to post response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const canRespond =
    userId &&
    (userRole === 'admin' || (userRole === 'vendor' && userId === productVendorId)) &&
    !review.review_responses?.some((r) => r.responder_type === userRole);

  return (
    <div className="glass-card p-6 space-y-4">
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
            {review.verified_purchase && (
              <Badge className="bg-green-500/20 text-green-200 border-green-500/30 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verified Purchase
              </Badge>
            )}
          </div>

          <h4 className="text-lg font-semibold text-white mb-2">{review.title}</h4>

          <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
            <span>{review.users?.full_name || 'Anonymous'}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
          </div>

          <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{review.review_text}</p>
        </div>
      </div>

      {review.review_responses && review.review_responses.length > 0 && (
        <div className="space-y-3 pl-6 border-l-2 border-white/10">
          {review.review_responses.map((response) => (
            <div key={response.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    response.responder_type === 'admin'
                      ? 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                      : 'bg-purple-500/20 text-purple-200 border-purple-500/30'
                  }
                >
                  {response.responder_type === 'admin' ? 'Admin Response' : 'Vendor Response'}
                </Badge>
                <span className="text-sm text-white/60">
                  {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{response.response_text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVote}
          disabled={voting || !userId}
          className={`text-white/70 hover:text-white hover:bg-white/10 ${
            hasVoted ? 'text-[#d4af8a]' : ''
          }`}
        >
          {voting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ThumbsUp className={`w-4 h-4 mr-2 ${hasVoted ? 'fill-current' : ''}`} />
          )}
          Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
        </Button>

        {canRespond && !showResponseForm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResponseForm(true)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Respond
          </Button>
        )}
      </div>

      {showResponseForm && (
        <div className="space-y-3 pl-6 pt-4 border-t border-white/10">
          <Textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Write your response..."
            maxLength={2000}
            rows={4}
            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">{responseText.length}/2000 characters (minimum 10)</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowResponseForm(false);
                  setResponseText('');
                }}
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitResponse}
                disabled={submittingResponse || responseText.length < 10}
                className="celestial-button text-white"
              >
                {submittingResponse ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Response
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
