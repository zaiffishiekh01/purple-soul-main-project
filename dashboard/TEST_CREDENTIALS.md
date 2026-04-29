# Test Credentials - Purple Soul Collective by DKC

## Approval Workflow

**IMPORTANT:** All new vendors require admin approval before accessing their dashboard.

**Workflow:**
1. Admin logs in and goes to "Vendor Management"
2. Admin views pending vendors and clicks to view details
3. Admin clicks "Approve Vendor" button
4. Vendor can now access their dashboard

---

## Admin Portal

### Super Admin Account
- **Email:** `fk.envcal@gmail.com`
- **Password:** Contact system administrator
- **Role:** Super Admin
- **Access:** Full platform management

**Portal URL:** `/login/admin` or click "Sign in as Admin" from home

---

## Vendor Portal

### Test Vendor Accounts

All vendor accounts are in **pending approval** status. Admin must approve them before they can access the dashboard.

#### 1. Purple Soul Crafts
- **Email:** `test.vendor@purple-soul.com`
- **Password:** `VendorTest123!`
- **Business Type:** Islamic Art & Crafts
- **Phone:** +1-555-2001
- **Status:** Pending Approval

#### 2. Halal Foods Market
- **Email:** `halal.foods@purple-soul.com`
- **Password:** `HalalVendor123!`
- **Business Type:** Food & Halal Products
- **Phone:** +1-555-2002
- **Status:** Pending Approval

#### 3. Islamic Literature Store
- **Email:** `islamic.books@purple-soul.com`
- **Password:** `BookVendor123!`
- **Business Type:** Books & Islamic Literature
- **Phone:** +1-555-2003
- **Status:** Pending Approval

#### 4. Modest Fashion Boutique
- **Email:** `modest.fashion@purple-soul.com`
- **Password:** `FashionVendor123!`
- **Business Type:** Clothing & Accessories
- **Phone:** +1-555-2004
- **Status:** Pending Approval

**Portal URL:** `/login/vendor` or click "Sign in as Vendor" from home

---

## Quick Start Guide

### For Admins (Approve Vendors First):
1. Go to the home page and click "Sign in as Admin"
2. Use the admin credentials
3. Navigate to "Vendor Management" in the admin dashboard
4. Click the eye icon to view vendor details
5. Click "Approve Vendor" to activate the vendor account
6. Vendor will receive access to their dashboard

### For Vendors (After Approval):
1. Go to the home page and click "Sign in as Vendor"
2. Use any of the vendor credentials above
3. If not approved yet, you'll see a "Pending Approval" screen
4. Once approved by admin, access your dashboard and start adding products

---

## Features Available to Test

### Vendor Dashboard:
- Dashboard overview with metrics
- Product management (add/edit/delete products)
- Order management with status updates
- Inventory tracking
- Shipping label generation
- Returns processing
- Financial transactions & payouts
- Support ticket system
- Real-time notifications
- Bulk operations
- CSV export

### Admin Dashboard:
- Vendor management & approval
- Platform-wide order oversight
- Product management across all vendors
- Finance & payout management
- Analytics & reporting
- Platform settings
- Admin user management
- Product guidelines

---

## Database Information

- **Database:** Supabase PostgreSQL
- **URL:** `https://iqyfllnizpfpoomqbeut.supabase.co`
- **Test Data:**
  - 4 vendor accounts awaiting approval
  - Sample products, orders, and transactions
  - Complete workflow test data

---

## Creating Additional Test Accounts

### Create New Vendor (using Edge Function):
```bash
curl -X POST "https://iqyfllnizpfpoomqbeut.supabase.co/functions/v1/create-vendor" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newvendor@example.com",
    "password": "YourPassword123!",
    "businessName": "Your Business Name",
    "businessType": "E-commerce",
    "contactPhone": "+1-555-0000"
  }'
```

### Or Sign Up Through UI:
1. Go to `/login/vendor`
2. Click "Sign Up"
3. Fill in the registration form
4. Account will be created with "Pending Approval" status
5. Admin must approve the account before vendor can access dashboard

---

## Security Notes

- All passwords follow strong password requirements
- Accounts use Supabase Auth with email/password
- Row Level Security (RLS) is enabled on all tables
- Each vendor can only access their own data
- Admin accounts have elevated permissions

---

**Last Updated:** February 3, 2026
**Status:** Ready for Testing
