import React, { useState, useEffect } from 'react';
import { Check, X, Eye, AlertCircle, Filter, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminReviewModeration() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    let query = supabase
      .from('product_reviews_moderated')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const updateReviewStatus = async (reviewId: string, newStatus: string, notes?: string) => {
    const { error } = await supabase
      .from('product_reviews_moderated')
      .update({
        status: newStatus,
        moderated_at: new Date().toISOString(),
        moderator_notes: notes || null
      })
      .eq('id', reviewId);

    if (!error) {
      fetchReviews();
    }
  };

  const filteredReviews = reviews.filter(review =>
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Review Moderation</h1>
          <p className="text-secondary">Manage customer reviews and maintain quality standards</p>
        </div>

        <div className="bg-surface border border-default rounded-2xl shadow-theme-lg mb-8 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'edited_pending', 'approved', 'rejected', 'hidden'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize ${
                    filter === status
                      ? 'bg-purple-600 dark:bg-purple-700 text-white'
                      : 'bg-surface-elevated dark:bg-surface-deep text-secondary hover:bg-purple-100 dark:hover:bg-purple-900/30'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reviews..."
                className="w-full pl-10 pr-4 py-2 bg-surface-elevated dark:bg-surface-deep border border-default rounded-lg text-primary focus:border-purple-300 dark:focus:border-purple-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            <p className="text-secondary mt-4">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-default rounded-2xl">
            <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-secondary">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-surface border border-default rounded-2xl p-6 shadow-theme-md">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-primary text-lg">{review.title}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        review.status === 'pending' || review.status === 'edited_pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : review.status === 'approved'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : review.status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-400'
                      }`}>
                        {review.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-secondary mb-3">
                      <span>Rating: {review.rating}/5</span>
                      <span>•</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      {review.updated_at !== review.created_at && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-600 dark:text-yellow-400">
                            Edited {new Date(review.updated_at).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-secondary leading-relaxed">{review.content}</p>
                </div>

                {review.used_for && (
                  <div className="mb-4">
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full capitalize">
                      Used for: {review.used_for}
                    </span>
                  </div>
                )}

                {review.recommend !== null && (
                  <div className="mb-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      review.recommend
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {review.recommend ? 'Recommends product' : 'Does not recommend'}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-default">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'approved')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-semibold hover:bg-green-200 dark:hover:bg-green-800/40 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  )}

                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => {
                        const notes = prompt('Reason for rejection (optional):');
                        updateReviewStatus(review.id, 'rejected', notes || undefined);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-800/40 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  )}

                  {review.status !== 'hidden' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'hidden')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-400 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700/40 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      Hide
                    </button>
                  )}
                </div>

                {review.moderator_notes && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Moderator Notes:</strong> {review.moderator_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
