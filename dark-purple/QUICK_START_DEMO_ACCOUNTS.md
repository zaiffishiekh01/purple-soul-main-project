# ⚡ Quick Start: Demo Accounts

**Get started testing in 2 minutes!**

---

## 🚀 Option 1: Automated Setup (Recommended)

### Step 1: Start Your Server
```bash
npm run dev
```

### Step 2: Run the Setup Script
```bash
node scripts/register-demo-accounts-via-api.js
```

### Step 3: Start Testing!
The script will output your login credentials. Done! 🎉

---

## 📝 Option 2: Manual Registration

### Step 1: Register via UI

Navigate to your site and register these 3 accounts:

**Customer:**
- Email: `customer@demo.com`
- Password: `Customer123!`
- Name: `Demo Customer`

**Vendor:**
- Email: `vendor@demo.com`
- Password: `Vendor123!`
- Name: `Demo Vendor`

**Admin:**
- Email: `admin@demo.com`
- Password: `Admin123!`
- Name: `Demo Administrator`

### Step 2: Assign Roles

Go to Supabase SQL Editor and run:
```sql
-- Copy/paste from scripts/create-demo-accounts.sql
-- Lines 7-188 (the role assignment section)
```

---

## 🔑 Login Credentials

### Customer Account
```
Email: customer@demo.com
Password: Customer123!
Access: /account
```

### Vendor Account
```
Email: vendor@demo.com
Password: Vendor123!
Access: /vendor
```

### Admin Account
```
Email: admin@demo.com
Password: Admin123!
Access: /admin
```

---

## ✅ Quick Test

1. **Login as Customer**
   - Add items to cart
   - Complete checkout
   - View order in `/account/orders`

2. **Login as Vendor**
   - See the order in `/vendor/orders`
   - Update order status
   - Manage products in `/vendor/products`

3. **Login as Admin**
   - View all orders in `/admin/orders`
   - Manage vendors in `/admin/vendors`
   - Access analytics in `/admin/analytics`

---

## 📚 Full Documentation

- **DEMO_CREDENTIALS.md** - Complete testing guide with all features
- **HOW_TO_CREATE_DEMO_ACCOUNTS.md** - Detailed setup instructions
- **VENDOR_DASHBOARD_INTEGRATION_COMPLETE.md** - Technical integration details

---

## 🐛 Troubleshooting

**Script fails with connection error?**
→ Make sure `npm run dev` is running

**Can't login?**
→ Double-check email/password (case-sensitive)

**Can't access dashboard?**
→ Roles might not be assigned, run SQL script manually

---

**Happy Testing! 🎉**
