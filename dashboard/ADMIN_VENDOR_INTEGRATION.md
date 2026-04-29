# Admin-Vendor Dashboard Integration

## Overview
The admin and vendor dashboards are fully integrated and share the same database. This document explains how they work together.

## Key Integration Points

### 1. Vendor Approval Workflow
**Flow:** Vendor Registration → Admin Review → Vendor Access

- **Vendor Side:**
  - New vendors register via `/login/vendor`
  - After registration, vendors see a "Pending Approval" page
  - Cannot access dashboard until approved

- **Admin Side:**
  - Admin sees new vendor in "Pending Approvals" (Dashboard overview)
  - Admin navigates to Vendors section
  - Admin can approve, reject, or suspend vendors
  - On approval, vendor status changes to "active"

- **Result:**
  - Approved vendors immediately gain dashboard access
  - Vendors receive notification (via database trigger)

### 2. Product Management Integration
**Flow:** Vendor Creates Product → Admin Can View/Manage → Appears in E-commerce

- **Vendor Side:**
  - Vendors create products in their Products section
  - Products are saved with `vendor_id` foreign key
  - Only vendors can see their own products

- **Admin Side:**
  - Admin sees ALL products from ALL vendors in "All Products"
  - Admin can view, edit, or delete any product
  - Admin can filter by vendor or category

- **Database:** `products` table with RLS policies
  - Vendors: `SELECT`, `INSERT`, `UPDATE` own products
  - Admins: `SELECT`, `UPDATE`, `DELETE` all products

### 3. Order Management Integration
**Flow:** Customer Orders → Vendor Fulfills → Admin Monitors

- **Vendor Side:**
  - Vendors see only their orders
  - Can update order status
  - Can create shipping labels

- **Admin Side:**
  - Admin sees ALL orders from ALL vendors
  - Can view order details
  - Can monitor fulfillment across platform

- **Database:** `orders` table with RLS policies
  - Vendors: `SELECT`, `UPDATE` orders with `vendor_id` match
  - Admins: `SELECT`, `UPDATE` all orders

### 4. Finance & Transaction Integration
**Flow:** Sales → Vendor Balance → Payouts → Admin Oversight

- **Vendor Side:**
  - Vendors see their transaction history
  - Can view their balance
  - Can request payouts
  - See commission fees

- **Admin Side:**
  - Admin sees ALL transactions across platform
  - Can view total revenue, fees collected
  - Can process pending payouts
  - Monitor platform finances

- **Database:** `transactions` table
  - Vendors: See only their transactions
  - Admins: See all transactions

### 5. Analytics Integration
**Flow:** Platform Activity → Data Collection → Reports

- **Vendor Side:**
  - Vendors see their own metrics
  - Order trends, revenue, top products

- **Admin Side:**
  - Admin sees platform-wide metrics
  - Top performing vendors
  - Revenue trends across all vendors
  - Category performance

## Data Flow Architecture

```
┌─────────────────┐
│  E-Commerce     │
│  (Future)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Supabase DB    │────▶│    Admin     │
│  - vendors      │     │  Dashboard   │
│  - products     │     │  (All data)  │
│  - orders       │     └──────────────┘
│  - transactions │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Vendor       │
│   Dashboard     │
│ (Filtered data) │
└─────────────────┘
```

## Permission System

### Admin Permissions
Admins have granular permissions stored in `admin_users.permissions`:
- `vendor_management`: Approve, suspend, manage vendors
- `order_management`: View and manage all orders
- `product_management`: View and manage all products
- `finance_management`: View finances, process payouts
- `analytics_monitoring`: View platform analytics

Super admins (`role = 'super_admin'`) have all permissions automatically.

### Vendor Permissions
Vendors have implicit permissions based on ownership:
- Can only access data where `vendor_id` matches their ID
- Cannot see other vendors' data
- Cannot access admin features

## RLS Policies

All tables use Row Level Security (RLS):

**Vendors Table:**
- Vendors can view/update own profile
- Admins can view/update all vendors

**Products Table:**
- Vendors can CRUD own products
- Admins can view/update/delete all products

**Orders Table:**
- Vendors can view/update own orders
- Admins can view/update all orders

**Transactions Table:**
- Vendors can view own transactions
- Admins can view all transactions

## Testing Integration

### Test Scenario 1: Vendor Approval
1. Create vendor account → Status: Pending
2. Login as admin → See vendor in pending list
3. Approve vendor → Status: Active
4. Vendor can now login and access dashboard

### Test Scenario 2: Product Visibility
1. Vendor creates product "Book A"
2. Admin navigates to All Products
3. Admin sees "Book A" in the list
4. Admin can edit or delete it

### Test Scenario 3: Order Fulfillment
1. Order created in system (manual/e-commerce)
2. Vendor sees order, marks as "Processing"
3. Admin sees status update in All Orders
4. Vendor ships order
5. Admin sees "Shipped" status

## E-commerce Integration (Next Phase)

When integrating with e-commerce:

1. **Product Catalog:** Pull products where `status = 'active'`
2. **Order Creation:** Create orders with `vendor_id` from product
3. **Inventory Updates:** Sync stock between e-commerce and vendor dashboard
4. **Customer Data:** Link orders to customer accounts
5. **Payment Processing:** Record transactions for both vendor and platform

## API Endpoints for E-commerce

Future edge functions needed:
- `GET /api/products` - Public product catalog
- `POST /api/orders` - Create order from e-commerce
- `POST /api/webhooks/payment` - Handle payment confirmations
- `GET /api/vendor/:id/products` - Vendor-specific products

## Security Considerations

1. **Data Isolation:** Vendors never see other vendors' data
2. **Admin Access Control:** Admins checked via `admin_users` table
3. **API Security:** All functions verify authentication
4. **RLS Enforcement:** Database-level security, not just app-level
5. **Audit Logging:** Track admin actions on vendor data

## Current Status

✅ Admin dashboard fully functional
✅ Vendor dashboard fully functional
✅ Database integration complete
✅ RLS policies implemented
✅ Permission system working
⏳ E-commerce integration (next phase)

## Next Steps for E-commerce

1. Design customer-facing storefront
2. Create public product catalog API
3. Implement shopping cart functionality
4. Add payment processing (Stripe/PayPal)
5. Create order webhook system
6. Build customer account system
7. Add review and rating system
