'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Tag, Loader2 } from 'lucide-react';

interface CouponInputProps {
  cartTotal: number;
  onCouponApplied: (coupon: any) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: any;
}

export function CouponInput({
  cartTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!code) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          cart_total: cartTotal
        })
      });

      const data = await response.json();

      if (data.valid) {
        onCouponApplied(data);
        setCode('');
      } else {
        setError(data.error || 'Invalid coupon code');
      }
    } catch (error) {
      setError('Failed to validate coupon');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-medium text-green-900">Coupon applied!</p>
            <p className="text-sm text-green-700">{appliedCoupon.description}</p>
            <p className="text-sm font-bold text-green-900 mt-1">
              -${appliedCoupon.discount_amount.toFixed(2)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCouponRemoved}
            className="text-green-700 hover:text-green-900"
          >
            Remove
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Enter coupon code"
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button
          onClick={handleApplyCoupon}
          disabled={!code || loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      {error && (
        <Alert variant="destructive" className="py-2">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
