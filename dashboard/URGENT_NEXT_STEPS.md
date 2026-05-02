# 🔴 CREATE-ADMIN 401 ERROR - INVESTIGATION SUMMARY

## Problem
Creating a new admin from the Admin Dashboard returns:
```
Edge Function returned a non-2xx status code
POST https://your-dashboard.example.com/api/functions/create-admin 401 (Unauthorized)
```

---

## ✅ Changes Applied

### 1. **Replaced `supabase.functions.invoke()` with direct `fetch()`**
   - **File:** `dashboard/src/hooks/useAdminPermissions.ts`
   - **Why:** The Supabase client may not be properly attaching auth headers
   - **What changed:** Using native `fetch()` with explicit `Authorization` header

### 2. **Added Comprehensive Logging**
   - Session validation check
   - Token expiry information
   - Full request/response logging
   - Specific error messages for each failure scenario

### 3. **Enhanced Supabase Client Configuration**
   - **File:** `dashboard/src/lib/supabase.ts`
   - Added explicit auth configuration options
   - Better token refresh handling

---

## 🔍 NEXT STEPS - DO THIS NOW

### Step 1: Hard Refresh Your Browser
```
Press: Ctrl + Shift + R (or Cmd + Shift + R on Mac)
```
This ensures you're loading the updated code.

### Step 2: Open Browser Console (F12)
Go to your admin dashboard page and open the console.

### Step 3: Try Creating an Admin Again
Click "Add Admin" and fill out the form.

### Step 4: Check the Console Output
You should now see detailed logs like:
```
🔍 Session check: { hasSession: true, hasToken: true, ... }
🔑 Invoking create-admin with auth token
🔑 Token preview: eyJhbGciOiJIUzI1NiIsInR...
📥 Edge function response status: 401
📥 Edge function response data: { error: "..." }
```

### Step 5: Copy & Share the Console Output
**Send me these lines from the console:**
1. The `🔍 Session check:` line
2. The `📥 Edge function response status:` line
3. The `📥 Edge function response data:` line

This will tell us EXACTLY what's wrong!

---

## 🧪 Alternative: Use the Test Tool

I've created a standalone HTML test tool:

**File:** `dashboard/scripts/test-edge-function.html`

**How to use:**
1. Open the file in your browser (double-click it)
2. Get your auth token from browser console:
   ```javascript
   supabase.auth.getSession().then(s => console.log(s.data.session.access_token))
   ```
3. Paste the token into the test tool
4. Click "Test Edge Function"
5. It will show you exactly what's wrong

---

## 🔧 Most Likely Fixes

### 1. **You're Not a Super Admin** (80% chance)

**Symptom:** Console shows `403` or error says "Only super admins can create admin users"

**Fix:** Run this SQL in Supabase Dashboard → SQL Editor:
```sql
-- Replace with YOUR actual user ID (find it in auth.users table)
UPDATE admin_users 
SET is_super_admin = true, 
    role = 'super_admin',
    permissions = '{"vendor_management":true,"order_management":true,"product_management":true,"finance_management":true,"analytics_monitoring":true}'::jsonb
WHERE user_id = 'YOUR_USER_ID_HERE';
```

### 2. **Edge Function Not Deployed** (15% chance)

**Symptom:** Console shows `500 Internal Server Error` or function doesn't respond

**Fix:**
```bash
cd dashboard
supabase functions deploy create-admin
```

### 3. **Missing Edge Function Secrets** (5% chance)

**Symptom:** Console shows `500` with error about database or Supabase client

**Fix:**
```bash
supabase secrets set \
  SUPABASE_URL=https://your-dashboard.example.com \
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY \
  --project-ref naesxujdffcmatntrlfr
```

Find `SUPABASE_SERVICE_ROLE_KEY` at:
https://your-database-admin.example/settings/api

---

## 📁 Files Modified

1. ✅ `dashboard/src/hooks/useAdminPermissions.ts` - createAdmin() function
2. ✅ `dashboard/src/lib/supabase.ts` - Client configuration
3. ✅ `dashboard/CREATE_ADMIN_401_FIX.md` - Detailed troubleshooting guide
4. ✅ `dashboard/scripts/test-edge-function.html` - Standalone test tool
5. ✅ `dashboard/scripts/test-create-admin-auth.js` - Console diagnostic script

---

## ❓ What I Need From You

After trying to create an admin with the updated code, **copy and paste the console output** here, specifically:

```
🔍 Session check: {...}
📥 Edge function response status: XXX
📥 Edge function response data: {...}
```

With this information, I can pinpoint the exact issue!
