# 🔑 Demo Account Credentials

This document contains test credentials for exploring all areas of the Purple Soul Collective platform.

---

## 📋 Quick Setup

### Option 1: Run SQL Script (Recommended)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/qvzeptnrikucdpabizev/editor
2. Open the SQL Editor
3. Copy the contents of `scripts/create-demo-accounts.sql`
4. Paste and run the SQL script
5. You should see success messages for each account created

### Option 2: Manual Creation

Use the registration form on your site and then manually assign roles in the database.

---

## 🎭 Test Accounts

### 👤 CUSTOMER ACCOUNT

**Login Credentials:**
```
Email:    customer@demo.com
Password: Customer123!
```

**Access Level:** Customer/Shopper

**What You Can Do:**
- ✅ Browse and search the product catalog
- ✅ Add items to cart and wishlist
- ✅ Complete checkout process
- ✅ View and track orders
- ✅ Manage shipping addresses
- ✅ Leave product reviews
- ✅ Manage account settings
- ✅ View order history

**Dashboard URL:** `/account`

**Key Pages to Explore:**
- `/account` - Account overview
- `/account/orders` - Order history and tracking
- `/account/wishlist` - Saved items
- `/account/addresses` - Shipping addresses
- `/account/profile` - Personal information
- `/cart` - Shopping cart
- `/checkout` - Checkout flow

---

### 🏪 VENDOR ACCOUNT

**Login Credentials:**
```
Email:    vendor@demo.com
Password: Vendor123!
```

**Access Level:** Vendor/Seller

**Business Profile:**
- Business Name: Sacred Crafts Studio
- Business Type: Artisan
- Description: Handcrafted Islamic prayer items with traditional techniques

**What You Can Do:**
- ✅ All customer features (shopping, orders, etc.)
- ✅ Manage product catalog (add, edit, delete products)
- ✅ Upload and manage product images
- ✅ Track inventory levels
- ✅ View and fulfill customer orders
- ✅ Update order status (confirmed, picking, packed, shipped)
- ✅ View sales analytics and performance
- ✅ Respond to product reviews
- ✅ Manage business settings

**Dashboard URL:** `/vendor`

**Key Pages to Explore:**
- `/vendor` - Vendor dashboard with metrics
- `/vendor/products` - Product catalog management
- `/vendor/products/new` - Add new products
- `/vendor/orders` - Customer orders to fulfill
- `/vendor/inventory` - Stock level management
- `/vendor/analytics` - Sales performance and trends
- `/vendor/reviews` - Customer reviews and ratings
- `/vendor/settings` - Business profile settings

---

### 👑 ADMIN ACCOUNT

**Login Credentials:**
```
Email:    admin@demo.com
Password: Admin123!
```

**Access Level:** Administrator (Full Access)

**What You Can Do:**
- ✅ All customer features
- ✅ All vendor features
- ✅ Manage all vendors (approve, suspend, view)
- ✅ Manage entire product catalog
- ✅ View and manage all orders
- ✅ Moderate product reviews
- ✅ Manage categories and site structure
- ✅ Create and manage discount coupons
- ✅ View platform-wide analytics
- ✅ Manage users and permissions
- ✅ Access audit logs
- ✅ Configure email templates

**Dashboard URL:** `/admin`

**Key Pages to Explore:**
- `/admin` - Admin overview dashboard
- `/admin/vendors` - Vendor management
- `/admin/products` - Product catalog oversight
- `/admin/orders` - All platform orders
- `/admin/reviews` - Review moderation
- `/admin/categories` - Category management
- `/admin/coupons` - Discount code management
- `/admin/analytics` - Platform-wide metrics
- `/admin/analytics-dashboard` - Advanced reporting

---

## 🔄 How the Accounts Are Connected

### Data Flow Example: Order Lifecycle

1. **Customer** (`customer@demo.com`)
   - Browses products on main site
   - Adds items to cart
   - Completes checkout
   - Order created in database

2. **Vendor** (`vendor@demo.com`)
   - Sees new order in `/vendor/orders`
   - Confirms order → status: "vendor_confirmed"
   - Picks items → status: "picking"
   - Packs order → status: "packed"
   - Ships order → status: "shipped" (adds tracking number)

3. **Customer** (back to `customer@demo.com`)
   - Receives email notification
   - Views order in `/account/orders`
   - Tracks shipment with tracking number
   - Receives product
   - Leaves a review

4. **Admin** (`admin@demo.com`)
   - Monitors all orders in `/admin/orders`
   - Views reviews in `/admin/reviews`
   - Sees vendor performance in `/admin/vendors`
   - Accesses platform analytics in `/admin/analytics`

5. **Vendor** (back to `vendor@demo.com`)
   - Sees customer review in `/vendor/reviews`
   - Can respond to review
   - Views sales data in `/vendor/analytics`

### Shared Database Tables

All three account types interact with the same database:

```
┌─────────────────────────────────────────────────────┐
│                   SHARED DATABASE                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  users   │  │  roles   │  │ products │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  orders  │  │ vendors  │  │ reviews  │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   cart   │  │wishlist  │  │inventory │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
         ↓              ↓              ↓
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │Customer │  │ Vendor  │  │  Admin  │
    │Dashboard│  │Dashboard│  │Dashboard│
    └─────────┘  └─────────┘  └─────────┘
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Order Flow

1. **Login as Customer** (`customer@demo.com`)
   - Browse products at `/`
   - Add 2-3 items to cart
   - Go to `/cart` and proceed to checkout
   - Complete checkout at `/checkout/*`
   - Note your order number

2. **Login as Vendor** (`vendor@demo.com`)
   - Go to `/vendor/orders`
   - Find the order you just created
   - Click on it to see details
   - Update status through the fulfillment flow
   - Add a tracking number

3. **Login as Customer** (again)
   - Go to `/account/orders`
   - See the updated status
   - View tracking information

4. **Login as Admin** (`admin@demo.com`)
   - Go to `/admin/orders`
   - See all orders including the one you created
   - View vendor performance in `/admin/vendors`

### Scenario 2: Product Management

1. **Login as Vendor** (`vendor@demo.com`)
   - Go to `/vendor/products/new`
   - Create a new product with images
   - Set price and inventory
   - Save the product

2. **Login as Customer** (`customer@demo.com`)
   - Search for the product you created
   - Add it to wishlist
   - Leave a review (after "purchasing")

3. **Login as Admin** (`admin@demo.com`)
   - Go to `/admin/products`
   - See the newly created product
   - Moderate if needed

### Scenario 3: Multi-Vendor Order

1. **Login as Admin** (`admin@demo.com`)
   - Go to `/admin/vendors`
   - Create a second vendor account

2. **Login as Customer** (`customer@demo.com`)
   - Add products from multiple vendors to cart
   - Complete checkout
   - Order contains items from different vendors

3. **Login as each Vendor**
   - Each vendor sees only their portion of the order
   - Each fulfills their items independently
   - Customer receives multiple shipments

---

## 🔐 Security Notes

### Password Requirements

All demo passwords follow the platform's security requirements:
- ✅ At least 8 characters
- ✅ Contains uppercase letters
- ✅ Contains lowercase letters
- ✅ Contains numbers
- ✅ Contains special characters

### JWT Tokens

When you log in:
- Access token (short-lived, 15 minutes)
- Refresh token (long-lived, 7 days)
- Tokens stored in browser localStorage
- Auto-refresh before expiration

### Role-Based Access Control (RBAC)

Each account type has specific permissions:

**Customer Permissions:**
- `profile:read`, `profile:update`
- `cart:manage`
- `orders:read`, `orders:create`
- `wishlist:manage`
- `reviews:create`

**Vendor Permissions:**
- All customer permissions, plus:
- `vendor_dashboard:access`
- `vendor_products:manage`
- `vendor_orders:read`, `vendor_orders:update`
- `vendor_inventory:manage`
- `vendor_finance:read`

**Admin Permissions:**
- All vendor permissions, plus:
- `admin_dashboard:access`
- `admin_users:manage`
- `admin_vendors:manage`
- `admin_products:manage`
- `admin_orders:manage`
- `admin_analytics:access`
- `admin_audit_logs:read`

---

## 💡 Tips for Testing

### Use Multiple Browser Profiles

Test different roles simultaneously:
- **Chrome Profile 1**: Customer account
- **Chrome Profile 2**: Vendor account
- **Chrome Profile 3**: Admin account
- **Incognito Window**: Testing as guest

### Test on Different Devices

- **Desktop**: Full dashboard experience
- **Mobile**: Responsive layouts
- **Tablet**: Mixed experience

### Clear Data Between Tests

```javascript
// Open browser console and run:
localStorage.clear();
location.reload();
```

### Monitor Network Requests

Open browser DevTools (F12) → Network tab to see:
- API calls to `/api/auth/*`
- API calls to `/api/vendor/*`
- JWT tokens in Authorization headers
- Response status codes

---

## 🐛 Troubleshooting

### "Invalid credentials" Error

- Double-check email and password (case-sensitive)
- Ensure accounts were created (run SQL script)
- Check that user status is "active" in database

### Can't Access Dashboard

- Verify role assignment in `user_roles` table
- Clear browser cache and localStorage
- Try logging out and back in

### Order Not Showing in Vendor Dashboard

- Check that order contains vendor's products
- Verify `vendor_id` in `order_items` table
- Ensure RLS policies are correct

### Token Expired Error

- This is normal after 15 minutes of inactivity
- System should auto-refresh
- If not, log out and back in

---

## 📊 What to Look For

### Customer Dashboard
- Order history with status badges
- Tracking information display
- Wishlist functionality
- Address management
- Review submission

### Vendor Dashboard
- Revenue metrics and KPIs
- Order fulfillment workflow
- Product inventory alerts
- Sales analytics charts
- Review management

### Admin Dashboard
- Platform-wide statistics
- Vendor approval workflow
- Product moderation tools
- Order management interface
- Analytics and reporting

---

## 🎯 Key Features to Test

### Authentication
- ✅ Registration with email/password
- ✅ Login with JWT token generation
- ✅ Automatic token refresh
- ✅ Logout and token invalidation
- ✅ Role-based redirects after login

### Shopping Experience
- ✅ Product browsing and filtering
- ✅ Search functionality
- ✅ Add to cart
- ✅ Wishlist management
- ✅ Checkout flow
- ✅ Order confirmation

### Vendor Operations
- ✅ Product creation and editing
- ✅ Image uploads
- ✅ Inventory tracking
- ✅ Order fulfillment
- ✅ Status updates
- ✅ Review responses

### Admin Controls
- ✅ User management
- ✅ Vendor oversight
- ✅ Product moderation
- ✅ Order monitoring
- ✅ Analytics viewing
- ✅ System configuration

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Review Network tab for failed API calls
3. Verify database records in Supabase dashboard
4. Check audit logs for authentication events

---

**Happy Testing! 🎉**

*These credentials are for demo/testing purposes only. Use strong, unique passwords in production.*
