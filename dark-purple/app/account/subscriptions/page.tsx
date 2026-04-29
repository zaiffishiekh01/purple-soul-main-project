'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sparkles, CreditCard, Pause, X, Edit, Loader2, Gift, Book, Headphones } from 'lucide-react';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-200 border-green-500/30',
  paused: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  cancelled: 'bg-red-500/20 text-red-200 border-red-500/30',
  expired: 'bg-gray-500/20 text-gray-200 border-gray-500/30',
};

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);

      const { data: activeData, error: activeError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', user?.id)
        .in('status', ['active', 'paused'])
        .order('created_at', { ascending: false });

      if (activeError && activeError.code !== 'PGRST116') {
        console.error('Error fetching active subscriptions:', activeError);
      }
      setSubscriptions(activeData || []);

      const { data: historyData, error: historyError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', user?.id)
        .in('status', ['cancelled', 'expired'])
        .order('created_at', { ascending: false });

      if (historyError && historyError.code !== 'PGRST116') {
        console.error('Error fetching subscription history:', historyError);
      }
      setSubscriptionHistory(historyData || []);

    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'paused' })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast.success('Subscription paused');
      fetchSubscriptions();
    } catch (error: any) {
      console.error('Error pausing subscription:', error);
      toast.error(error.message || 'Failed to pause subscription');
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast.success('Subscription cancelled');
      fetchSubscriptions();
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    }
  };

  const getSubscriptionIcon = (planType: string) => {
    switch (planType) {
      case 'digital_gifts':
        return <Gift className="w-5 h-5" style={{ color: '#d4af8a' }} />;
      case 'learning':
        return <Book className="w-5 h-5" style={{ color: '#d4af8a' }} />;
      case 'audio':
        return <Headphones className="w-5 h-5" style={{ color: '#d4af8a' }} />;
      default:
        return <Calendar className="w-5 h-5" style={{ color: '#d4af8a' }} />;
    }
  };

  const paginatedHistory = subscriptionHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(subscriptionHistory.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Sparkles className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Digital Access</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight">
              Subscriptions
            </h1>

            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Manage your digital access plans
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="ethereal-divider mb-12"></div>

            <div className="space-y-8">
              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-serif">Active Subscriptions</CardTitle>
                  <CardDescription className="text-white/60 text-base mt-2">
                    Your current digital access plans
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {subscriptions.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass-card">
                        <Calendar className="w-10 h-10" style={{ color: '#d4af8a' }} />
                      </div>
                      <h3 className="text-2xl font-serif font-semibold mb-4 text-white">
                        No active subscriptions
                      </h3>
                      <p className="text-base text-white/60 mb-8">
                        Explore our digital content and learning resources
                      </p>
                      <Link href="/c/digital-gifts">
                        <Button className="celestial-button text-white">
                          Explore Digital Access
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {subscriptions.map((subscription: any) => (
                        <div key={subscription.id} className="p-6 glass-card rounded-lg">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center glass-card">
                                {getSubscriptionIcon(subscription.plan_type)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-white font-semibold text-lg">{subscription.plan_name}</h3>
                                  <Badge className={statusColors[subscription.status] || statusColors.active}>
                                    {subscription.status}
                                  </Badge>
                                </div>
                                <p className="text-white/60 text-sm">
                                  {subscription.plan_type.replace(/_/g, ' ')} subscription
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold text-xl">${parseFloat(subscription.price || 0).toFixed(2)}</p>
                              <p className="text-white/60 text-sm">per {subscription.billing_cycle || 'month'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-white/5 rounded-lg">
                              <p className="text-white/60 text-sm mb-1">Next Renewal</p>
                              <p className="text-white font-medium">
                                {subscription.next_billing_date
                                  ? new Date(subscription.next_billing_date).toLocaleDateString()
                                  : 'Not set'}
                              </p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                              <p className="text-white/60 text-sm mb-1">Payment Method</p>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-white/70" />
                                <p className="text-white font-medium">
                                  {subscription.payment_method || '****'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                            {subscription.status === 'active' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePauseSubscription(subscription.id)}
                                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                                >
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Update Payment
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelSubscription(subscription.id)}
                                  className="bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/20"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            {subscription.status === 'paused' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                              >
                                Resume Subscription
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-serif">Subscription History</CardTitle>
                  <CardDescription className="text-white/60 text-base mt-2">
                    Past and cancelled subscriptions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {subscriptionHistory.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-base text-white/60">
                        No subscription history
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {paginatedHistory.map((subscription: any) => (
                          <div key={subscription.id} className="p-4 glass-card rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center glass-card">
                                  {getSubscriptionIcon(subscription.plan_type)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-white font-semibold">{subscription.plan_name}</p>
                                    <Badge className={statusColors[subscription.status] || statusColors.cancelled}>
                                      {subscription.status}
                                    </Badge>
                                  </div>
                                  <p className="text-white/60 text-sm">
                                    {subscription.status === 'cancelled'
                                      ? `Cancelled ${formatDistanceToNow(new Date(subscription.updated_at), { addSuffix: true })}`
                                      : `Expired ${formatDistanceToNow(new Date(subscription.updated_at), { addSuffix: true })}`}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-semibold">${parseFloat(subscription.price || 0).toFixed(2)}</p>
                                <p className="text-white/60 text-sm">per {subscription.billing_cycle || 'month'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                          >
                            Previous
                          </Button>
                          <span className="text-white/70 text-sm">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center glass-card flex-shrink-0">
                      <Gift className="w-6 h-6" style={{ color: '#d4af8a' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2">
                        Discover Digital Content
                      </h3>
                      <p className="text-white/60 text-base mb-4">
                        Access exclusive digital gifts, learning resources, and audio content with our subscription plans.
                      </p>
                      <Link href="/c/digital-gifts">
                        <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                          Browse Digital Catalog
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
