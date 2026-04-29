import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { supabase, PaymentPlan } from '../lib/supabase';

interface PaymentPlanManagerProps {
  productId?: string;
  productPrice?: number;
  onPlanCreated?: (planId: string) => void;
}

export default function PaymentPlanManager({ productId, productPrice, onPlanCreated }: PaymentPlanManagerProps) {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState(3);
  const [depositPercent, setDepositPercent] = useState(20);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) {
      loadUserPlans();
    }
  }, [productId]);

  async function loadUserPlans() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setPlans(data);
  }

  async function createPaymentPlan() {
    if (!productId || !productPrice) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to create a payment plan');
      return;
    }

    setLoading(true);

    const depositAmount = productPrice * (depositPercent / 100);
    const remainingAmount = productPrice - depositAmount;
    const installmentAmount = remainingAmount / selectedInstallments;

    const nextPaymentDate = new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

    const { data, error } = await supabase
      .from('payment_plans')
      .insert({
        user_id: user.id,
        product_id: productId,
        total_amount: productPrice,
        deposit_amount: depositAmount,
        installment_amount: installmentAmount,
        installment_count: selectedInstallments,
        installments_paid: 0,
        next_payment_date: nextPaymentDate.toISOString().split('T')[0]
      })
      .select()
      .single();

    setLoading(false);

    if (!error && data) {
      setShowCreateForm(false);
      if (onPlanCreated) onPlanCreated(data.id);
      alert('Payment plan created successfully!');
    }
  }

  function calculateMonthlyPayment() {
    if (!productPrice) return 0;
    const deposit = productPrice * (depositPercent / 100);
    const remaining = productPrice - deposit;
    return remaining / selectedInstallments;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'text-purple-600 bg-purple-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'defaulted':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-secondary bg-surface-deep';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'defaulted':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  }

  if (productId && productPrice) {
    return (
      <div className="bg-surface-deep rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-600" />
          Payment Plan Available
        </h3>

        {!showCreateForm ? (
          <div>
            <p className="text-secondary mb-4">
              Spread the cost with flexible payment plans. Pay a deposit today and the rest in installments.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium"
            >
              Set Up Payment Plan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Initial Deposit: {depositPercent}%
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={depositPercent}
                onChange={(e) => setDepositPercent(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-secondary mt-1">
                <span>10%</span>
                <span className="font-semibold text-amber-600">
                  ${(productPrice * (depositPercent / 100)).toFixed(2)} today
                </span>
                <span>50%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Number of Monthly Payments
              </label>
              <select
                value={selectedInstallments}
                onChange={(e) => setSelectedInstallments(parseInt(e.target.value))}
                className="w-full p-3 border rounded-lg"
              >
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={9}>9 months</option>
                <option value={12}>12 months</option>
              </select>
            </div>

            <div className="bg-surface p-4 rounded-lg border-2 border-amber-200">
              <h4 className="font-semibold text-primary mb-3">Payment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Total Price</span>
                  <span className="font-semibold">${productPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Deposit ({depositPercent}%)</span>
                  <span className="font-semibold">${(productPrice * (depositPercent / 100)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-secondary">Monthly Payment</span>
                  <span className="font-semibold text-amber-600">
                    ${calculateMonthlyPayment().toFixed(2)} × {selectedInstallments}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createPaymentPlan}
                disabled={loading}
                className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Payment Plan'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 border border-default rounded-lg hover:bg-surface-deep"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-muted">
              By creating a payment plan, you agree to make monthly payments on time.
              Your item will be shipped after the deposit is received.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">My Payment Plans</h1>
        <p className="text-secondary">Manage your active payment plans and view history</p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 bg-surface-deep rounded-lg">
          <DollarSign className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="text-secondary">No payment plans yet</p>
          <p className="text-sm text-muted">Browse products and select payment plan at checkout</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const progress = (plan.installments_paid / plan.installment_count) * 100;
            const isCompleted = plan.status === 'completed';
            const isPastDue = new Date(plan.next_payment_date) < new Date() && !isCompleted;

            return (
              <div key={plan.id} className="bg-surface rounded-lg shadow-theme-md p-6 border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-1">
                      Product ID: {plan.product_id}
                    </h3>
                    <p className="text-secondary">Total: ${plan.total_amount.toFixed(2)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(plan.status)}`}>
                    {getStatusIcon(plan.status)}
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-secondary mb-2">
                    <span>Payment Progress</span>
                    <span className="font-semibold">
                      {plan.installments_paid} of {plan.installment_count} payments
                    </span>
                  </div>
                  <div className="w-full bg-surface-deep rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-amber-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {!isCompleted && (
                  <div className="grid md:grid-cols-3 gap-4 bg-surface-deep p-4 rounded-lg">
                    <div>
                      <div className="text-sm text-secondary mb-1">Next Payment</div>
                      <div className="font-semibold text-primary">
                        ${plan.installment_amount.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-secondary mb-1">Due Date</div>
                      <div className={`font-semibold ${isPastDue ? 'text-red-600' : 'text-primary'}`}>
                        {new Date(plan.next_payment_date).toLocaleDateString()}
                        {isPastDue && ' (Past Due)'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-secondary mb-1">Remaining</div>
                      <div className="font-semibold text-primary">
                        ${((plan.installment_count - plan.installments_paid) * plan.installment_amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                {plan.status === 'active' && (
                  <button className="w-full mt-4 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium">
                    Make Payment
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
