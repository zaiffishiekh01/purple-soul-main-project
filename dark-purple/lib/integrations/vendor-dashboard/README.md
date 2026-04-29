# Vendor Dashboard Integration

This document describes how the Abrahamic Faith Ecommerce Platform integrates with the existing **Sufi Science Center Modern Vendor Dashboard** (built 25 November 2025).

## Overview

The public ecommerce platform and vendor dashboard are designed to work together as a unified system, sharing the same PostgreSQL database while maintaining separate user interfaces for different audiences:

- **Public Shop** (this project): Customer-facing marketplace for browsing and purchasing products
- **Vendor Dashboard** (existing project): Vendor-facing portal for managing products, orders, and fulfillment

## Shared Database Architecture

Both systems connect to the same Supabase PostgreSQL database with the following shared tables:

### Core Shared Tables

1. **vendors** - Vendor business profiles and settings
2. **products** - Product catalog managed by vendors
3. **orders** - Customer orders that vendors must fulfill
4. **order_items** - Line items linking orders to products and vendors
5. **shipments** - Shipping information managed by vendors
6. **returns** - Return requests that vendors process
7. **refunds** - Refund records tied to returns
8. **users** - Shared authentication and user profiles

## Data Flow

### Order Creation Flow
1. Customer creates order in **Public Shop**
2. Order is inserted into `orders` table with status `created`
3. Order items are inserted into `order_items` table, each linked to a vendor
4. **Vendor Dashboard** receives notification of new order
5. Vendor confirms order and updates status to `vendor_confirmed`

### Fulfillment Flow
1. Vendor marks order as `picking` → `packed` in **Vendor Dashboard**
2. Vendor creates shipping label and updates `shipments` table
3. Vendor marks order as `shipped` with tracking number
4. **Public Shop** displays tracking information to customer
5. Carrier updates delivery status

### Returns Flow
1. Customer requests return in **Public Shop**
2. Return record created in `returns` table with status `requested`
3. **Vendor Dashboard** shows pending return
4. Vendor approves/rejects return
5. If approved, customer ships item back
6. Vendor receives item and triggers refund

## Integration Points

### Data Mapping

The `types/vendor-dashboard-contract.ts` file provides type definitions and mapping functions to ensure data compatibility between systems:

```typescript
import { VendorDashboardMapper } from '@/types/vendor-dashboard-contract';

const vendorOrder = VendorDashboardMapper.mapOrderToVendorFormat(publicOrder);
```

### Webhook Events

Both systems can emit and consume webhook events for real-time synchronization:

- `order.created` - New order placed by customer
- `order.updated` - Order status changed
- `return.requested` - Customer requested return
- `shipment.updated` - Shipment status changed

### API Compatibility

The public shop exposes API endpoints that the vendor dashboard can consume:

```typescript
GET /api/vendors/:id/orders - List orders for a vendor
GET /api/orders/:id - Get order details
PATCH /api/vendors/:id/orders/:orderId/status - Update order status
POST /api/shipping/label - Generate shipping label
```

## Field Mapping

### Order Fields

| Public Shop | Vendor Dashboard | Notes |
|------------|------------------|-------|
| `id` | `id` | UUID, same in both systems |
| `customer_id` | N/A | Not exposed to vendor |
| `shipping_address` | `shipping_address` | Limited customer info |
| `contact_info.email` | `customer_email` | For communication |
| `status` | `status` | Same enum values |
| `total` | `total` | Same currency/format |

### Product Fields

| Public Shop | Vendor Dashboard | Notes |
|------------|------------------|-------|
| `title` | `name` | Product display name |
| `layer1_category_slug` | `category` | Category classification |
| `price` | `price` | Same format |
| `stock_quantity` | `stock` | Inventory count |
| `is_active` | `status` | `active`/`draft`/`archived` |

## Multi-Vendor Order Handling

When a customer order contains items from multiple vendors:

1. Single order record is created in `orders` table
2. Multiple `order_items` records are created, each with `vendor_id`
3. Each vendor sees only their items in **Vendor Dashboard**
4. Multiple `shipments` records are created, one per vendor
5. Customer sees all shipments in **Public Shop** order tracking

## Security & Access Control

### Row Level Security (RLS) Policies

The database uses RLS policies to ensure:

- Customers can only see their own orders
- Vendors can only see orders containing their products
- Vendors cannot see other vendors' product data
- Admin users have full access

### Authentication

The platform uses a JWT-based API authentication system with role-based access control (RBAC):

- **JWT Tokens** - Secure authentication with access and refresh tokens
- **Role-Based Access** - `customer`, `vendor`, and `admin` roles
- **Permission System** - Fine-grained permissions for resources and actions
- **Audit Logging** - All authentication events are logged

API authentication endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT tokens
- `POST /api/auth/logout` - Logout and invalidate tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

## Environment Variables

Both systems require these shared environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Migration Path

To connect an existing vendor dashboard to this public shop:

1. Ensure both systems point to the same Supabase project
2. Run database migrations from the public shop (if newer)
3. Update vendor dashboard queries to use shared table structure
4. Test order flow end-to-end
5. Configure webhook endpoints for real-time updates
6. Deploy both systems

## Testing Integration

### Local Development

1. Start both applications locally
2. Use the same Supabase project URL and keys
3. Create a test order in public shop
4. Verify order appears in vendor dashboard
5. Update order status in vendor dashboard
6. Verify status reflects in public shop

### Staging Environment

1. Deploy both apps to staging
2. Run end-to-end order fulfillment test
3. Test multi-vendor orders
4. Test return/refund flow
5. Monitor webhook delivery

## Troubleshooting

### Order Not Appearing in Vendor Dashboard

- Check RLS policies on `orders` and `order_items` tables
- Verify vendor user ID matches `vendor_id` in order items
- Check `order_items` were created correctly

### Status Updates Not Syncing

- Verify both systems use same enum values
- Check webhook endpoints are configured
- Review database triggers for status changes

### Product Data Mismatch

- Run data mapper functions to standardize fields
- Check for schema version differences
- Verify product IDs are UUIDs in both systems

## Future Enhancements

- Real-time order notifications via Supabase Realtime
- Automated inventory sync between systems
- Unified reporting dashboard
- Vendor performance analytics
- Customer review integration
