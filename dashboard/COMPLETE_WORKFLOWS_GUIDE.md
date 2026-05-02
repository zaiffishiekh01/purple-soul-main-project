# SSC Marketplace - Complete Workflows Guide

## Overview
This document provides a comprehensive guide to all vendor workflows in the SSC Marketplace platform.

---

## 1. RETURNS MANAGEMENT WORKFLOW

### Complete Return Lifecycle

#### Step 1: Customer Initiates Return (Marketplace Frontend)
- Customer requests return within return window (30 days default)
- System creates return record in `returns` table with status `pending` or `requested`
- Vendor receives notification

#### Step 2: Vendor Reviews Return Request
**Location**: Vendor Dashboard → Returns

**Available Actions**:
- ✅ **Approve Return**: Accept the return request
- ❌ **Reject Return**: Decline with reason

**Process**:
1. Click "Approve" or "Reject" button
2. Modal opens with return details
3. Add optional notes
4. Submit action

**Database Updates** (Approve):
```sql
UPDATE returns SET
  status = 'approved',
  approved_at = NOW(),
  notes = [vendor notes]
WHERE id = [return_id];
```

**Database Updates** (Reject):
```sql
UPDATE returns SET
  status = 'rejected',
  processed_at = NOW(),
  notes = [rejection reason]
WHERE id = [return_id];
```

#### Step 3: Customer Ships Return (After Approval)
- Customer ships product back to vendor
- Marketplace provides return shipping label
- Status remains: `approved`

#### Step 4: Vendor Marks Item as Received
**Action**: Click "Mark Received" button

**Database Updates**:
```sql
UPDATE returns SET
  status = 'received',
  received_at = NOW(),
  notes = [vendor notes]
WHERE id = [return_id];
```

#### Step 5: Vendor Processes Refund
**Action**: Click "Process Refund" button

**Refund Options**:
- Refund Method: Original payment / Store credit / Other
- Refund Amount: Full amount or partial (with restocking fee)
- Apply restocking fee (optional)

**Process**:
1. Modal displays refund calculator
2. Vendor sets refund method and amount
3. System calls edge function `/api/process-refund`
4. Edge function:
   - Creates refund transaction in payment system
   - Updates return status to `completed` or `refunded`
   - Creates transaction record
   - Updates vendor payouts accordingly

**Database Updates**:
```sql
UPDATE returns SET
  status = 'refunded',
  refunded_at = NOW(),
  processed_at = NOW(),
  refund_transaction_id = [transaction_id]
WHERE id = [return_id];

INSERT INTO transactions (
  vendor_id,
  type,
  amount,
  status,
  created_at
) VALUES (
  [vendor_id],
  'refund',
  -[refund_amount],
  'completed',
  NOW()
);
```

### Return Statuses
- `pending` / `requested`: Awaiting vendor approval
- `approved`: Vendor approved, awaiting return shipment
- `rejected`: Vendor rejected the return
- `in_transit`: Return package in transit (optional)
- `received`: Vendor received returned item
- `completed` / `refunded`: Refund processed successfully

### Return Policy Settings
- Default Return Window: **30 days**
- Return Shipping: **Paid by Marketplace**
- Vendor Response Time: **2 business days**
- Category-Specific Rules:
  - Electronics: 14 days
  - Clothing: 60 days
  - Food & Beverages: 7 days

---

## 2. ORDER MANAGEMENT WORKFLOW

### Complete Order Lifecycle

#### Step 1: New Order Received
**Status**: `pending`
**Location**: Vendor Dashboard → Orders

**Vendor Actions**:
- View order details
- Review items and quantities
- Check customer information
- Verify payment received

#### Step 2: Order Processing
**Action**: Click "Process Order" or "Mark as Processing"

**Database Updates**:
```sql
UPDATE orders SET
  status = 'processing',
  updated_at = NOW()
WHERE id = [order_id];
```

#### Step 3: Create Shipment
**Action**: Click "Create Shipment" from order actions

**Process**:
1. Select carrier (USPS, FedEx, UPS, DHL)
2. Select shipping method (Standard, Express, Overnight)
3. Generate shipping label (optional)
4. Enter tracking number

**Database Updates**:
```sql
INSERT INTO shipments (
  order_id,
  vendor_id,
  tracking_number,
  carrier,
  shipping_method,
  status,
  created_at
) VALUES (
  [order_id],
  [vendor_id],
  [tracking_number],
  [carrier],
  [shipping_method],
  'pending',
  NOW()
);

UPDATE orders SET
  status = 'shipped',
  shipped_at = NOW()
WHERE id = [order_id];
```

#### Step 4: Mark as Delivered
**Trigger**: Automatic via carrier tracking updates OR manual by vendor

**Database Updates**:
```sql
UPDATE shipments SET
  status = 'delivered',
  delivered_at = NOW()
WHERE id = [shipment_id];

UPDATE orders SET
  status = 'delivered'
WHERE id = [order_id];
```

#### Step 5: Order Completion
**Status**: `completed`
- Automatically set after delivery confirmation
- Funds released to vendor payout

### Order Statuses
- `pending`: New order, awaiting processing
- `processing`: Vendor preparing order
- `shipped`: Order dispatched, in transit
- `delivered`: Successfully delivered
- `cancelled`: Order cancelled
- `completed`: Order fulfilled and finalized

---

## 3. SHIPPING MANAGEMENT WORKFLOW

### Create Shipping Label

**Location**: Vendor Dashboard → Shipping OR Orders → Create Shipment

**Process**:
1. **Select Order**: Choose order that needs shipping
2. **Enter Package Details**:
   - Weight (lbs)
   - Dimensions (L x W x H inches)
   - Package type

3. **Get Shipping Rates**:
   - System calls `/api/calculate-shipping-rates`
   - Displays rates from multiple carriers
   - Shows delivery estimates

4. **Select Rate and Generate Label**:
   - Choose shipping option
   - System calls `/api/generate-shipping-label`
   - Generates printable label
   - Creates shipment record with tracking number

**Database Updates**:
```sql
INSERT INTO shipping_labels (
  order_id,
  vendor_id,
  carrier,
  service,
  tracking_number,
  label_url,
  cost,
  status,
  created_at
) VALUES (...);

INSERT INTO shipments (
  order_id,
  vendor_id,
  tracking_number,
  carrier,
  shipping_method,
  status,
  shipping_label_id,
  created_at
) VALUES (...);
```

### Track Shipments

**Location**: Vendor Dashboard → Shipping

**Features**:
- View all active shipments
- Track delivery status
- See estimated delivery dates
- Access shipping labels
- Update tracking information

---

## 4. INVENTORY MANAGEMENT WORKFLOW

### View Inventory

**Location**: Vendor Dashboard → Inventory

**Features**:
- See all products with stock levels
- View reserved quantities (orders in process)
- Available quantity = Total quantity - Reserved
- Low stock alerts

### Update Stock Levels

**Actions**:
1. **Restock Item**: Add quantity to existing stock
2. **Adjust Quantity**: Set new quantity manually
3. **Set Low Stock Threshold**: Configure alert level

**Database Updates** (Restock):
```sql
UPDATE inventory SET
  quantity = quantity + [additional_quantity],
  last_restocked_at = NOW(),
  updated_at = NOW()
WHERE id = [inventory_id];
```

### Low Stock Alerts

**Trigger**: When `quantity <= low_stock_threshold`

**Notifications**:
- Dashboard alert badge
- Recent activity widget
- Optional email notifications (future enhancement)

---

## 5. PRODUCT MANAGEMENT WORKFLOW

### Add New Product

**Location**: Vendor Dashboard → Products → Add Product

**Required Fields**:
- Product Name
- Description
- Category
- SKU
- Base Price (what vendor sets and earns)
- Cost (your cost for analytics)
- Images (up to 5)

**Optional Fields**:
- Color
- Size/Dimensions
- Material
- Care Instructions
- Shipping Timeline
- Tags

**Database Updates**:
```sql
INSERT INTO products (
  vendor_id,
  name,
  description,
  category,
  sku,
  price,
  base_price,
  cost,
  images,
  status,
  created_at
) VALUES (...);

-- Create inventory record
INSERT INTO inventory (
  vendor_id,
  product_id,
  quantity,
  reserved_quantity,
  low_stock_threshold,
  updated_at
) VALUES (
  [vendor_id],
  [product_id],
  [initial_quantity],
  0,
  10,
  NOW()
);
```

### Edit Product

**Process**:
1. Navigate to Products page
2. Click "Edit" on product
3. Modify fields
4. Save changes

**Notes**:
- Cannot change SKU once created
- Price changes affect new orders only
- Image uploads go to Supabase Storage

### Product Status Management

**Available Statuses**:
- `draft`: Not visible to customers
- `active`: Live on marketplace
- `inactive`: Temporarily unavailable
- `archived`: Removed from marketplace

---

## 6. TRANSACTION & FINANCE WORKFLOW

### View Transactions

**Location**: Vendor Dashboard → Finance

**Transaction Types**:
- `payment`: Customer order payments
- `refund`: Return refunds (negative)
- `payout`: Platform payouts to vendor
- `fee`: Platform fees/commissions

### Payout Schedule

**Default Schedule**: Bi-weekly (every 2 weeks)

**Payout Calculation**:
```
Total Orders Amount (base_price × quantity)
- Refunds
- Platform Commission
- Processing Fees
= Net Payout
```

**Database Schema**:
```sql
SELECT
  SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END) as total_sales,
  SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END) as total_refunds,
  SUM(CASE WHEN type = 'fee' THEN amount ELSE 0 END) as total_fees,
  SUM(amount) as net_amount
FROM transactions
WHERE vendor_id = [vendor_id]
  AND created_at >= [payout_period_start]
  AND created_at < [payout_period_end];
```

---

## 7. SUPPORT TICKET WORKFLOW

### Create Support Ticket

**Location**: Vendor Dashboard → Support → New Ticket

**Process**:
1. Select ticket type (Technical, Order, Product, Payment)
2. Choose priority (Low, Medium, High)
3. Enter subject and description
4. Attach files (optional)
5. Submit ticket

**Database Updates**:
```sql
INSERT INTO support_tickets (
  vendor_id,
  subject,
  description,
  category,
  priority,
  status,
  created_at
) VALUES (
  [vendor_id],
  [subject],
  [description],
  [category],
  [priority],
  'open',
  NOW()
);
```

### Ticket Lifecycle

**Statuses**:
- `open`: New ticket awaiting response
- `in_progress`: Admin is working on it
- `waiting_on_vendor`: Requires vendor response
- `resolved`: Issue resolved
- `closed`: Ticket closed

### Reply to Ticket

**Process**:
1. Open ticket from support list
2. View conversation history
3. Type response
4. Attach files if needed
5. Submit reply

**Database Updates**:
```sql
INSERT INTO ticket_messages (
  ticket_id,
  user_id,
  message,
  created_at
) VALUES (
  [ticket_id],
  [user_id],
  [message],
  NOW()
);

UPDATE support_tickets SET
  status = 'in_progress',
  updated_at = NOW()
WHERE id = [ticket_id];
```

---

## QUICK TROUBLESHOOTING

### Returns Not Working
1. Check if return exists in database
2. Verify vendor_id matches logged-in vendor
3. Check return status is valid for action
4. Review browser console for API errors
5. Verify edge function `/api/process-refund` is deployed

### Orders Not Showing
1. Verify vendor profile is complete
2. Check RLS policies on orders table
3. Ensure vendor_id is correctly set
4. Review useOrders hook for errors

### Inventory Not Updating
1. Check product_id exists
2. Verify inventory record exists
3. Review quantity calculation logic
4. Ensure RLS policies allow updates

### Shipping Labels Failing
1. Verify carrier integration credentials
2. Check package dimensions are valid
3. Ensure addresses are complete
4. Review edge function logs

---

## DATABASE TABLES REFERENCE

### Core Tables
- `vendors`: Vendor profiles
- `products`: Product catalog
- `inventory`: Stock levels
- `orders`: Customer orders
- `order_items`: Order line items
- `shipments`: Shipping records
- `shipping_labels`: Generated labels
- `returns`: Return requests
- `transactions`: Financial records
- `support_tickets`: Help tickets
- `ticket_messages`: Ticket replies

### All Tables Have RLS Enabled
- Vendors can only access their own data
- Admins have full access
- Proper policies enforce data isolation

---

## EDGE FUNCTIONS REFERENCE

### Available Functions
1. `/api/calculate-shipping-rates` - Get carrier rates
2. `/api/generate-shipping-label` - Create label
3. `/api/process-refund` - Process returns refund
4. `/api/generate-invoice-pdf` - Create order invoice
5. `/api/create-payment-intent` - Process payments
6. `/api/send-email` - Send notifications

### Usage Pattern
```typescript
const apiUrl = `${import.meta.env.NEXTAUTH_URL}/api/[function-name]`;

const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(params),
});
```

---

## SUPPORT

For additional help:
- Check browser console for error messages
- Review database logs in Supabase dashboard
- Test API endpoints with sample data
- Verify environment variables are set correctly

---

**Last Updated**: 2025-11-17
**Version**: 1.0
