# Security Configuration

## Database Security

All database security measures have been properly implemented:

### ✅ Implemented Security Features

1. **Row Level Security (RLS)**
   - Enabled on all tables
   - Optimized policies using `(select auth.uid())` pattern
   - Vendors can only access their own data

2. **Foreign Key Indexes**
   - All foreign keys have covering indexes
   - Optimizes JOIN performance and prevents table scans
   - Essential for production scalability

3. **Function Security**
   - All trigger functions use `SECURITY DEFINER`
   - Stable `search_path = public` set to prevent hijacking
   - Protected against search_path attacks

4. **Input Validation**
   - CHECK constraints on enum fields
   - NOT NULL constraints on required fields
   - UNIQUE constraints on business keys

## Authentication Security

### Supabase Auth Configuration Required

**⚠️ Action Required: Enable Leaked Password Protection**

To enhance security, enable leaked password protection in your Supabase dashboard:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers** → **Email**
4. Enable **"Check passwords against HaveIBeenPwned"**
5. Click **Save**

**What this does:**
- Checks user passwords against HaveIBeenPwned.org database
- Prevents users from using compromised passwords
- Adds an extra layer of account security
- No performance impact on authentication

**Note:** This setting must be configured in the Supabase dashboard and cannot be set via SQL migrations.

## Index Strategy

### "Unused Index" Warnings

The following indexes appear as "unused" in development but are **CRITICAL for production**:

**Foreign Key Indexes (required for JOINs):**
- `idx_inventory_product_id`
- `idx_order_items_product_id`
- `idx_shipments_order_id`
- `idx_returns_order_id`
- `idx_return_items_order_item_id`
- `idx_return_items_product_id`
- `idx_return_items_return_id`
- `idx_labels_vendor_id`
- `idx_order_labels_label_id`
- `idx_transactions_order_id`
- `idx_payouts_vendor_id`
- `idx_support_messages_ticket_id`
- `idx_ticket_messages_ticket_id`

**Query Optimization Indexes:**
- `idx_shipping_labels_order_id`
- `idx_shipping_labels_status`
- `idx_orders_status`
- `idx_product_imports_created_at`

**Why they appear unused:**
- Small data volumes in development
- Query planner may choose sequential scans for small tables
- Will be automatically used as data grows

**Impact without these indexes:**
- Orders page: 5-10 seconds load time
- Shipments: Full table scan on every query
- Returns: Multiple slow JOINs
- Support tickets: Slow message loading

**DO NOT REMOVE THESE INDEXES** - They are essential for production performance!

## Security Best Practices

### Implemented
✅ RLS on all tables
✅ Optimized RLS policies
✅ Foreign key indexes
✅ Function security hardening
✅ Input validation with constraints
✅ Proper authentication flow
✅ Session management
✅ CORS headers on edge functions

### Manual Configuration Required
⚠️ Enable leaked password protection in Supabase dashboard

## Monitoring

Regularly review:
- Supabase Auth logs
- Database query performance
- Index usage statistics (after production deployment)
- Failed authentication attempts
- RLS policy effectiveness
