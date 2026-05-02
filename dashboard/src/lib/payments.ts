import { dashboardClient } from './data-client';
import { authenticatedFetch } from './authenticated-fetch';

export interface PaymentIntentRequest {
  amount: number;
  orderId: string;
  customerEmail: string;
  currency?: string;
}

export async function createPaymentIntent(
  request: PaymentIntentRequest,
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  try {
    const { data: { session } } = await dashboardClient.auth.getSession();

    if (!session) {
      console.error('No active session');
      return null;
    }

    const response = await authenticatedFetch(`/api/functions/create-payment-intent`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Payment intent creation failed:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
}

export async function calculateShippingRates(params: {
  fromZip: string;
  toZip: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
}): Promise<any[] | null> {
  try {
    const { data: { session } } = await dashboardClient.auth.getSession();

    if (!session) {
      console.error('No active session');
      return null;
    }

    const response = await authenticatedFetch(`/api/functions/calculate-shipping-rates`, {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Shipping rate calculation failed:', error);
      return null;
    }

    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error calculating shipping rates:', error);
    return null;
  }
}

export async function generateShippingLabel(params: {
  orderId: string;
  carrier: string;
  serviceType: string;
}): Promise<{ html: string; trackingNumber: string } | null> {
  try {
    const { data: { session } } = await dashboardClient.auth.getSession();

    if (!session) {
      console.error('No active session');
      return null;
    }

    const response = await authenticatedFetch(`/api/functions/generate-shipping-label`, {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Shipping label generation failed:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating shipping label:', error);
    return null;
  }
}

export async function generateInvoicePDF(orderId: string): Promise<string | null> {
  try {
    const { data: { session } } = await dashboardClient.auth.getSession();

    if (!session) {
      console.error('No active session');
      return null;
    }

    const response = await authenticatedFetch(`/api/functions/generate-invoice-pdf`, {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Invoice generation failed:', error);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error('Error generating invoice:', error);
    return null;
  }
}

export async function processRefund(params: {
  returnId: string;
  refundAmount: number;
  refundMethod: string;
  notes?: string;
}): Promise<{ success: boolean; message: string; refund_id?: string } | null> {
  try {
    const { data: { session } } = await dashboardClient.auth.getSession();

    if (!session) {
      console.error('No active session');
      return null;
    }

    const response = await authenticatedFetch(`/api/functions/process-refund`, {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Refund processing failed:', error);
      throw new Error(error.message || 'Failed to process refund');
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
}

export function printHTML(html: string) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
