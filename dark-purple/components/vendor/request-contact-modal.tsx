"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, CircleAlert as AlertCircle, Loader as Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RequestContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  orderId?: string;
  productId?: string;
  orderNumber?: string;
}

const REASON_CATEGORIES = [
  { value: 'order_inquiry', label: 'Order Inquiry' },
  { value: 'shipping_issue', label: 'Shipping Issue' },
  { value: 'product_question', label: 'Product Question' },
  { value: 'return_assistance', label: 'Return Assistance' },
  { value: 'custom_order', label: 'Custom Order Request' },
  { value: 'other', label: 'Other' },
];

export function RequestContactModal({
  open,
  onOpenChange,
  customerId,
  orderId,
  productId,
  orderNumber,
}: RequestContactModalProps) {
  const [reasonCategory, setReasonCategory] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reasonCategory || !reasonText) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (reasonText.length < 20) {
      toast.error('Please provide at least 20 characters explaining why you need to contact the customer');
      return;
    }

    if (reasonText.length > 1000) {
      toast.error('Reason is too long. Maximum 1000 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/vendor/contact-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          order_id: orderId,
          product_id: productId,
          reason_category: reasonCategory,
          reason_text: reasonText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit contact request');
      }

      toast.success('Contact request submitted! Admin will review your request.');
      onOpenChange(false);

      // Reset form
      setReasonCategory('');
      setReasonText('');

    } catch (error: any) {
      console.error('Contact request error:', error);
      toast.error(error.message || 'Failed to submit contact request');
    } finally {
      setIsLoading(false);
    }
  };

  const characterCount = reasonText.length;
  const isValidLength = characterCount >= 20 && characterCount <= 1000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Request Customer Contact</DialogTitle>
          <DialogDescription>
            {orderNumber ? `Request permission to contact the customer about Order #${orderNumber}` : 'Request permission to contact this customer'}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Customer privacy is protected. An admin will review your request before you can contact the customer.
            If approved, you'll be able to message the customer through our secure platform.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason-category">
              Reason Category <span className="text-red-500">*</span>
            </Label>
            <Select value={reasonCategory} onValueChange={setReasonCategory}>
              <SelectTrigger id="reason-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {REASON_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason-text">
              Detailed Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason-text"
              placeholder="Explain why you need to contact this customer (minimum 20 characters)..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              rows={5}
              className={!isValidLength && characterCount > 0 ? 'border-yellow-500' : ''}
            />
            <div className="flex justify-between text-xs">
              <span className={characterCount < 20 ? 'text-yellow-600' : 'text-muted-foreground'}>
                {characterCount < 20 ? `Need ${20 - characterCount} more characters` : `${characterCount} / 1000 characters`}
              </span>
            </div>
          </div>

          {!isValidLength && characterCount > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {characterCount < 20
                  ? 'Please provide more detail about why you need to contact the customer'
                  : 'Reason is too long. Please keep it under 1000 characters.'}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !isValidLength || !reasonCategory}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
