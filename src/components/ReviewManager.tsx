import React, { useState, useEffect } from 'react';
import { Star, X, AlertCircle, Check, Loader2, Camera, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReviewManagerProps {
  productId: string;
  userId: string | null;
  onClose: () => void;
  onSuccess: () => void;
  existingReview?: any;
}

export default function ReviewManager({
  productId,
  userId,
  onClose,
  onSuccess,
  existingReview
}: ReviewManagerProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [usedFor, setUsedFor] = useState<string>(existingReview?.used_for || '');
  const [recommend, setRecommend] = useState<boolean | null>(existingReview?.recommend ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPendingNotice, setShowPendingNotice] = useState(false);

  const isEditing = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError('You must be signed in to submit a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }

    if (content.trim().length < 20) {
      setError('Review must be at least 20 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reviewData = {
        product_id: productId,
        user_id: userId,
        rating,
        title: title.trim(),
        content: content.trim(),
        used_for: usedFor || null,
        recommend,
        status: 'pending',
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('product_reviews_moderated')
          .update(reviewData)
          .eq('id', existingReview.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('product_reviews_moderated')
          .insert([reviewData]);

        if (insertError) throw insertError;
      }

      setShowPendingNotice(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl max-w-2xl w-full shadow-theme-2xl border border-default max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-surface border-b border-default p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary">
                {isEditing ? 'Edit Your Review' : 'Write a Review'}
              </h2>
              <p className="text-sm text-secondary mt-1">
                {isEditing
                  ? 'Your changes will be reviewed before appearing publicly'
                  : 'Share your experience with this product'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-elevated rounded-lg transition-colors">
              <X className="w-6 h-6 text-secondary" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {showPendingNotice && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-green-900 dark:text-green-100 mb-1">
                    {isEditing ? 'Review Updated!' : 'Review Submitted!'}
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Your review is pending approval and will appear once moderated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-primary mb-3">Your Rating *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-semibold text-primary">
                  {rating === 5 ? 'Outstanding!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">Review Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience in one line"
              className="w-full px-4 py-3 bg-surface-elevated dark:bg-surface-deep border border-default rounded-xl focus:border-purple-300 dark:focus:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 text-primary"
              maxLength={100}
            />
            <p className="text-xs text-secondary mt-1">{title.length}/100 characters</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">Your Review *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell us about your experience with this product. What did you like? How did you use it?"
              rows={6}
              className="w-full px-4 py-3 bg-surface-elevated dark:bg-surface-deep border border-default rounded-xl focus:border-purple-300 dark:focus:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 text-primary resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-secondary mt-1">{content.length}/1000 characters</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">How did you use this? (Optional)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['prayer', 'home', 'gifting', 'decor', 'celebration', 'other'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setUsedFor(usedFor === option ? '' : option)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm capitalize ${
                    usedFor === option
                      ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'border-default hover:border-purple-300 dark:hover:border-purple-700 text-secondary'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-3">Would you recommend this? (Optional)</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={`flex-1 px-6 py-3 rounded-xl border-2 transition-all font-medium ${
                  recommend === true
                    ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'border-default hover:border-green-300 dark:hover:border-green-700 text-secondary'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={`flex-1 px-6 py-3 rounded-xl border-2 transition-all font-medium ${
                  recommend === false
                    ? 'border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'border-default hover:border-red-300 dark:hover:border-red-700 text-secondary'
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">Review Guidelines</p>
                <ul className="space-y-1 text-xs">
                  <li>• Be honest and constructive</li>
                  <li>• Focus on product quality and experience</li>
                  <li>• Your review will be moderated before publishing</li>
                  <li>• Approved reviews help other customers make informed decisions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-default">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-surface-elevated dark:bg-surface-deep border border-default rounded-xl font-bold text-primary hover:bg-surface hover:border-purple-300 dark:hover:border-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || title.trim().length < 5 || content.trim().length < 20}
              className="flex-1 gradient-purple-soul text-white px-6 py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-theme-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {isEditing ? 'Update Review' : 'Submit Review'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
