import { useState } from 'react';
import {
  Calendar, CreditCard, Pause, X, Edit, Gift, Book, Headphones,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Sparkles,
} from 'lucide-react';

interface SubscriptionsPageProps { onBack?: () => void; }

interface Subscription {
  id: string;
  planName: string;
  planType: string;
  price: number;
  billingCycle: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  nextBillingDate: string;
  paymentMethod: string;
  startDate: string;
}

const mockSubscriptions: Subscription[] = [
  {
    id: '1', planName: 'Monthly Artisan Box', planType: 'digital_gifts',
    price: 49.99, billingCycle: 'month', status: 'active',
    nextBillingDate: '2026-04-15', paymentMethod: 'Visa •••• 4242', startDate: '2026-01-15',
  },
  {
    id: '2', planName: 'Cultural Learning Pass', planType: 'learning',
    price: 9.99, billingCycle: 'month', status: 'active',
    nextBillingDate: '2026-04-08', paymentMethod: 'Visa •••• 4242', startDate: '2025-10-08',
  },
];

const mockHistory: Subscription[] = [
  {
    id: '3', planName: 'Audio Meditation Collection', planType: 'audio',
    price: 14.99, billingCycle: 'month', status: 'cancelled',
    nextBillingDate: '', paymentMethod: '', startDate: '2025-06-01',
  },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  paused: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  expired: 'bg-surface-deep text-secondary',
};

const planIcons: Record<string, typeof Gift> = {
  digital_gifts: Gift,
  learning: Book,
  audio: Headphones,
};

export default function SubscriptionsPage({ onBack }: SubscriptionsPageProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [history] = useState<Subscription[]>(mockHistory);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const itemsPerPage = 5;

  const handlePause = (id: string) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'paused' as const } : s));
    setSuccessMessage('Subscription paused');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancel = (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    setSuccessMessage('Subscription cancelled');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleResume = (id: string) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'active' as const } : s));
    setSuccessMessage('Subscription resumed');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(history.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Digital Access</span>
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Subscriptions</h2>
        <p className="text-secondary">Manage your digital access plans</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-400 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Active Subscriptions */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h3 className="text-lg font-bold text-primary mb-2">Active Subscriptions</h3>
        <p className="text-sm text-secondary mb-6">Your current digital access plans</p>

        {subscriptions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-surface-elevated border border-default">
              <Calendar className="w-10 h-10 text-muted" />
            </div>
            <h4 className="text-xl font-bold text-primary mb-2">No active subscriptions</h4>
            <p className="text-secondary mb-6">Explore our digital content and learning resources</p>
            <button className="gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
              Explore Digital Access
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {subscriptions.map(sub => {
              const PlanIcon = planIcons[sub.planType] || Calendar;
              return (
                <div key={sub.id} className="p-6 bg-surface-elevated border border-default rounded-xl">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <PlanIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-primary text-lg">{sub.planName}</h4>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusColors[sub.status]}`}>
                            {sub.status}
                          </span>
                        </div>
                        <p className="text-sm text-secondary">{sub.planType.replace(/_/g, ' ')} subscription</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-primary">${sub.price.toFixed(2)}</p>
                      <p className="text-sm text-secondary">per {sub.billingCycle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-surface rounded-lg">
                      <p className="text-xs text-secondary mb-1">Next Renewal</p>
                      <p className="font-medium text-primary">{sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : 'Not set'}</p>
                    </div>
                    <div className="p-3 bg-surface rounded-lg">
                      <p className="text-xs text-secondary mb-1">Payment Method</p>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted" />
                        <p className="font-medium text-primary">{sub.paymentMethod || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-default">
                    {sub.status === 'active' && (
                      <>
                        <button
                          onClick={() => handlePause(sub.id)}
                          className="px-3 py-2 border border-default rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-deep transition-colors flex items-center gap-1.5"
                        >
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </button>
                        <button className="px-3 py-2 border border-default rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-deep transition-colors flex items-center gap-1.5">
                          <Edit className="w-3.5 h-3.5" /> Update Payment
                        </button>
                        <button
                          onClick={() => handleCancel(sub.id)}
                          className="px-3 py-2 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </>
                    )}
                    {sub.status === 'paused' && (
                      <button
                        onClick={() => handleResume(sub.id)}
                        className="gradient-purple-soul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                      >
                        Resume Subscription
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subscription History */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h3 className="text-lg font-bold text-primary mb-2">Subscription History</h3>
        <p className="text-sm text-secondary mb-6">Past and cancelled subscriptions</p>

        {history.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-secondary">No subscription history</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedHistory.map(sub => {
                const PlanIcon = planIcons[sub.planType] || Calendar;
                return (
                  <div key={sub.id} className="p-4 bg-surface-elevated border border-default rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <PlanIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-primary">{sub.planName}</p>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusColors[sub.status]}`}>
                              {sub.status}
                            </span>
                          </div>
                          <p className="text-sm text-secondary">
                            {sub.status === 'cancelled' ? 'Cancelled' : 'Expired'} {new Date(sub.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">${sub.price.toFixed(2)}</p>
                        <p className="text-sm text-secondary">per {sub.billingCycle}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-default rounded-lg hover:bg-surface-elevated transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 text-primary" />
                </button>
                <span className="text-sm text-secondary">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-default rounded-lg hover:bg-surface-elevated transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4 text-primary" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-primary text-lg mb-2">Discover Digital Content</h4>
            <p className="text-secondary mb-4">
              Access exclusive digital gifts, learning resources, and audio content with our subscription plans.
            </p>
            <button className="px-4 py-2 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm font-medium">
              Browse Digital Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
