# API Integrations Guide

This document describes all the external API integrations implemented in the vendor dashboard.

## Overview

The following integrations are available:

1. **Stripe Payments** - Payment processing and webhooks
2. **Email Notifications** - Automated email sending via Resend
3. **Shipping Rates** - Dynamic shipping rate calculator
4. **Shipping Labels** - Automated label generation
5. **Invoice Generation** - PDF invoice creation
6. **Inventory Alerts** - Automated low stock notifications

## Required Environment Variables

To enable these integrations, configure the following environment variables in your Supabase project:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend Email API
RESEND_API_KEY=re_...
```

## 1. Stripe Payments

### Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Configure webhook endpoint: `https://your-dashboard.example.com/api/functions/stripe-webhook`

### Features

- Create payment intents for orders
- Automatic order status updates via webhooks
- Refund processing
- Transaction tracking

### Usage

```typescript
import { createPaymentIntent } from './lib/payments';

const result = await createPaymentIntent({
  amount: 99.99,
  orderId: 'order-123',
  customerEmail: 'customer@example.com',
  currency: 'usd'
});

if (result) {
  // Use result.clientSecret with Stripe.js on frontend
  console.log('Payment Intent:', result.paymentIntentId);
}
```

### Webhook Events Handled

- `payment_intent.succeeded` - Mark order as paid
- `payment_intent.payment_failed` - Mark order as failed
- `charge.refunded` - Process refund and update order

## 2. Email Notifications

### Setup

1. Create a Resend account at https://resend.com
2. Add and verify your domain
3. Get your API key from settings

### Features

- Order confirmation emails
- Shipping notification emails
- Support ticket responses
- Low stock alerts

### Usage

```typescript
import { sendOrderConfirmationEmail, sendShippingNotificationEmail } from './lib/email';

// Send order confirmation
await sendOrderConfirmationEmail('order-id');

// Send shipping notification
await sendShippingNotificationEmail('shipment-id');
```

### Email Templates

All email templates are defined in `src/lib/email-templates.ts` and include:

- Order confirmation with itemized details
- Shipping notifications with tracking info
- Support ticket acknowledgments
- Inventory low stock alerts

## 3. Shipping Rate Calculator

### Features

- Calculate shipping rates for USPS, UPS, and FedEx
- Multiple service levels (Ground, 2-Day, Overnight)
- Weight-based and distance-based pricing
- Estimated delivery times

### Usage

```typescript
import { calculateShippingRates } from './lib/payments';

const rates = await calculateShippingRates({
  fromZip: '10001',
  toZip: '90001',
  weight: 5, // pounds
  length: 12,
  width: 10,
  height: 8
});

// Returns array of shipping options with rates and delivery estimates
```

### Response Format

```json
{
  "rates": [
    {
      "carrier": "USPS",
      "service": "Priority Mail",
      "rate": 8.50,
      "estimatedDays": "2-3",
      "description": "Affordable and reliable"
    }
  ],
  "chargeableWeight": 5.2,
  "distance": 2800
}
```

## 4. Shipping Label Generation

### Features

- Generate printable shipping labels
- Automatic tracking number creation
- Support for multiple carriers
- Creates shipment records in database

### Usage

```typescript
import { generateShippingLabel, printHTML } from './lib/payments';

const label = await generateShippingLabel({
  orderId: 'order-123',
  carrier: 'UPS',
  serviceType: 'Ground'
});

if (label) {
  // Print the label
  printHTML(label.html);

  // Tracking number is saved automatically
  console.log('Tracking:', label.trackingNumber);
}
```

## 5. Invoice Generation

### Features

- Professional HTML invoices
- Order details with line items
- Vendor branding
- Print-ready format

### Usage

```typescript
import { generateInvoicePDF, printHTML } from './lib/payments';

const invoiceHTML = await generateInvoicePDF('order-id');

if (invoiceHTML) {
  // Print or display invoice
  printHTML(invoiceHTML);
}
```

## 6. Automated Inventory Alerts

### Features

- Scheduled checking of low stock items
- Email notifications to vendors
- In-app notifications
- Configurable thresholds per product

### Setup

This Edge Function can be triggered:

1. **Manually** via API call
2. **Via Cron Job** (recommended - set up in Supabase Dashboard)

#### Setting up Cron Job in Supabase

1. Go to Database > Cron Jobs
2. Add new job:
   ```sql
   SELECT net.http_post(
     url := 'https://your-dashboard.example.com/api/functions/inventory-alert-checker',
     headers := '{"Content-Type": "application/json"}'::jsonb
   );
   ```
3. Schedule: `0 9 * * *` (runs daily at 9 AM)

### Manual Trigger

```bash
curl -X POST https://your-dashboard.example.com/api/functions/inventory-alert-checker
```

## Bulk Operations

### Features

- Bulk update order status
- Bulk update product status
- Bulk price adjustments
- Bulk product imports from CSV
- Bulk inventory restocking

### Usage

```typescript
import {
  bulkUpdateOrderStatus,
  bulkUpdateProductPrices,
  bulkImportProducts
} from './lib/bulk-operations';

// Update multiple orders
const result = await bulkUpdateOrderStatus(
  ['order-1', 'order-2'],
  'shipped'
);

// Adjust prices
const priceResult = await bulkUpdateProductPrices(
  ['prod-1', 'prod-2'],
  { type: 'increase', value: 5.00 }
);

// Import from CSV
const csvData = parseCSV(csvText);
const importResult = await bulkImportProducts(csvData, vendorId);
```

## Real-Time Features

### Supabase Realtime Subscriptions

The dashboard automatically subscribes to real-time updates for:

- **Notifications** - New notifications appear instantly
- **Orders** - Order status changes reflect immediately
- **Inventory** - Stock level updates (when implemented)

These are implemented in:
- `src/hooks/useNotifications.ts`
- `src/hooks/useOrders.ts`

## Error Handling

All integration functions include error handling and logging:

```typescript
try {
  const result = await someIntegrationFunction();
  if (!result) {
    // Handle failure
    console.error('Operation failed');
  }
} catch (error) {
  console.error('Integration error:', error);
}
```

## Testing

### Test Mode

All integrations support test mode:

- **Stripe**: Use test API keys (sk_test_...)
- **Resend**: Use verified test domains
- **Shipping**: Currently uses calculated rates (not real carrier APIs)

### Production Checklist

Before going to production:

- [ ] Replace test API keys with production keys
- [ ] Verify domain for email sending
- [ ] Set up Stripe webhook endpoint
- [ ] Configure cron job for inventory alerts
- [ ] Test all payment flows end-to-end
- [ ] Test email deliverability
- [ ] Verify webhook signatures

## Monitoring

Monitor your integrations:

1. **Stripe Dashboard** - Payment success rates, disputes
2. **Resend Dashboard** - Email delivery rates, bounces
3. **Supabase Logs** - Edge Function execution logs
4. **Database** - Transaction records, error logs

## Security Best Practices

1. Never expose API keys in frontend code
2. All API calls go through Supabase Edge Functions
3. JWT verification enabled on all protected endpoints
4. Webhook signature verification for Stripe events
5. Rate limiting on public endpoints

## Support

For issues with specific integrations:

- **Stripe**: https://stripe.com/support
- **Resend**: https://resend.com/support
- **PostgreSQL**: https://www.postgresql.org/docs/

## Future Enhancements

Planned improvements:

1. Real carrier API integrations (UPS, FedEx, USPS)
2. Multi-currency support
3. Tax calculation service integration
4. Advanced analytics and reporting
5. SMS notifications
6. Automated payout scheduling with Stripe Connect
