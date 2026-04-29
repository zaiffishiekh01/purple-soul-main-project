# Admin Dashboard Documentation

## Overview

The admin dashboard provides platform-wide management capabilities for administrators to oversee all vendors, orders, products, and analytics.

## Admin Access

### Default Admin Credentials
- **Email:** admin@credlock.com
- **Role:** Super Admin

### Admin Roles

1. **Super Admin**
   - Full platform access
   - Manage vendors (approve, suspend, delete)
   - View all orders and products
   - Manage other admin users
   - Access to all analytics and finance data

2. **Admin**
   - Manage vendors (approve, suspend)
   - View all orders and products
   - Access to analytics

3. **Support**
   - View vendors and their information
   - Access to support tickets
   - Limited analytics access

## Features

### 1. Admin Overview Dashboard
- **Total Vendors:** Count of all registered vendors
- **Active Vendors:** Count of active vendors
- **Pending Approvals:** Vendors awaiting approval
- **Platform Revenue:** Total revenue across all vendors
- **Recent Vendors:** Latest vendor registrations
- **Status Distribution:** Visual breakdown of vendor statuses

### 2. Vendor Management
- **View All Vendors:** Complete list with search and filters
- **Vendor Details:**
  - Business information
  - Contact details
  - Address and location
  - Account creation date
  - Current status
- **Vendor Actions:**
  - Change status (Active, Pending, Suspended, Inactive)
  - View detailed information
  - Delete vendors

### 3. System-Wide Views
- **All Orders:** View orders from all vendors
- **All Products:** Browse products from all vendors
- **Platform Analytics:** Aggregated metrics and insights
- **Finance Overview:** Revenue and transaction data

## Database Schema

### admin_users Table
```sql
- id: uuid (Primary Key)
- user_id: uuid (References auth.users)
- role: text ('super_admin' | 'admin' | 'support')
- permissions: jsonb (Custom permissions object)
- created_at: timestamptz
- updated_at: timestamptz
```

### Permissions Structure
```json
{
  "manage_vendors": true,
  "manage_orders": true,
  "manage_products": true,
  "manage_users": true,
  "view_analytics": true,
  "manage_finance": true
}
```

## Security

### Row Level Security (RLS)
- Admins can only read their own admin data
- Super admins can manage all admin users
- All admin tables have RLS enabled

### Helper Functions
- `is_admin()`: Check if current user is an admin
- `is_super_admin()`: Check if current user is a super admin

## User Experience

### Admin Login Flow
1. User logs in with credentials
2. System checks if user has admin role
3. If admin: Redirected to Admin Dashboard
4. If vendor: Redirected to Vendor Dashboard

### Switching Dashboards
- Admins can only access the admin dashboard
- Vendors can only access their vendor dashboard
- System automatically routes based on role

## Color Scheme

Admin dashboard uses a **blue color scheme** to distinguish from the vendor dashboard (purple):
- Primary: Blue (600-700)
- Success: Green
- Warning: Yellow
- Error: Red

## Future Enhancements

Potential features to add:
- [ ] Admin user management interface
- [ ] Activity logs and audit trails
- [ ] Bulk vendor operations
- [ ] Advanced analytics and reporting
- [ ] Email notifications to vendors
- [ ] Vendor onboarding workflow
- [ ] Commission and fee management
- [ ] Platform settings configuration
