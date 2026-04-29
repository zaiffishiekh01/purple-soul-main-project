import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, DollarSign, Zap, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StripeConnectOnboardingProps {
  vendorId: string;
  businessName: string;
  email: string;
}

export function StripeConnectOnboarding({ vendorId, businessName, email }: StripeConnectOnboardingProps) {
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStripeStatus();
  }, [vendorId]);

  const fetchStripeStatus = async () => {
    try {
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('stripe_account_id, stripe_account_status, stripe_charges_enabled, stripe_payouts_enabled, stripe_onboarding_completed')
        .eq('id', vendorId)
        .single();

      if (vendorError) throw vendorError;
      setStripeStatus(vendor);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    setOnboarding(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-connect-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vendorId,
            businessName,
            email,
            country: 'US',
            returnUrl: `${window.location.origin}/vendor/profile?stripe_connected=true`,
            refreshUrl: `${window.location.origin}/vendor/profile?stripe_refresh=true`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start onboarding');
      }

      const data = await response.json();

      window.location.href = data.onboardingUrl;
    } catch (err: any) {
      setError(err.message);
      setOnboarding(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stripeStatus?.stripe_account_id) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Enable Automatic Payouts</h3>
            <p className="text-gray-700 mb-6">
              Connect your Stripe account to receive instant, automatic payouts when customers make purchases.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Instant Transfers</h4>
                </div>
                <p className="text-sm text-gray-600">Get paid automatically when orders are completed</p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Secure Processing</h4>
                </div>
                <p className="text-sm text-gray-600">Bank-level security powered by Stripe</p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Real-time Updates</h4>
                </div>
                <p className="text-sm text-gray-600">Track all transactions in your dashboard</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Failed to start onboarding</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={startOnboarding}
              disabled={onboarding}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
            >
              {onboarding ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Starting Onboarding...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Connect Stripe Account
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-3">
              You'll be redirected to Stripe to complete the secure onboarding process. It takes about 5 minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isFullyConnected = stripeStatus.stripe_charges_enabled && stripeStatus.stripe_payouts_enabled;
  const isPending = stripeStatus.stripe_account_status === 'pending' || !stripeStatus.stripe_onboarding_completed;

  return (
    <div className={`rounded-xl shadow-sm border p-6 ${
      isFullyConnected
        ? 'bg-green-50 border-green-200'
        : isPending
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${
          isFullyConnected
            ? 'bg-green-100'
            : isPending
            ? 'bg-yellow-100'
            : 'bg-red-100'
        }`}>
          {isFullyConnected ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : isPending ? (
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isFullyConnected
              ? 'Stripe Connected - Automatic Payouts Active'
              : isPending
              ? 'Stripe Connection Pending'
              : 'Stripe Connection Required'}
          </h3>

          {isFullyConnected && (
            <div className="space-y-3">
              <p className="text-gray-700">
                Your Stripe account is fully connected. You'll receive automatic payouts for all completed orders.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Charges Enabled</span>
                  </div>
                  <p className="text-xs text-gray-600">Can receive customer payments</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Payouts Enabled</span>
                  </div>
                  <p className="text-xs text-gray-600">Automatic transfers active</p>
                </div>
              </div>
            </div>
          )}

          {isPending && (
            <div className="space-y-3">
              <p className="text-gray-700">
                Your Stripe account connection is incomplete. Complete the onboarding to enable automatic payouts.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className={`bg-white rounded-lg p-3 border ${
                  stripeStatus.stripe_charges_enabled ? 'border-green-200' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {stripeStatus.stripe_charges_enabled ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-900">Charges</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {stripeStatus.stripe_charges_enabled ? 'Enabled' : 'Not enabled'}
                  </p>
                </div>
                <div className={`bg-white rounded-lg p-3 border ${
                  stripeStatus.stripe_payouts_enabled ? 'border-green-200' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {stripeStatus.stripe_payouts_enabled ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-900">Payouts</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {stripeStatus.stripe_payouts_enabled ? 'Enabled' : 'Not enabled'}
                  </p>
                </div>
              </div>
              <button
                onClick={startOnboarding}
                disabled={onboarding}
                className="mt-4 px-6 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
              >
                {onboarding ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Complete Stripe Onboarding
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
