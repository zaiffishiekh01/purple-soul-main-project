# CREATE-ADMIN 401 ERROR - DIAGNOSIS & FIX

## Current Issue
**Error:** `POST https://your-dashboard.example.com/api/functions/create-admin 401 (Unauthorized)`

## What I've Done

### ✅ Code Changes Applied

1. **Switched to direct `fetch()` call** instead of `supabase.functions.invoke()`
   - More explicit control over headers
   - Better error messages
   - Bypasses any Supabase client bugs

2. **Added comprehensive logging**
   - Session validation
   - Token preview
   - Response status and body

3. **Better error messages**
   - Specific messages for each error type
   - User-friendly instructions

---

## 🔍 DIAGNOSTIC STEPS

### Step 1: Check Browser Console

After refreshing the page and trying to create an admin again, look for these log messages:

```
🔍 Session check: { hasSession: true, hasToken: true, ... }
🔑 Invoking create-admin with auth token
🔑 Token preview: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
📥 Edge function response status: 401
📥 Edge function response data: { error: "..." }
```

**What to check:**
- ✅ Does it say `hasSession: true` and `hasToken: true`?
  - ❌ If NO → You're not logged in. Sign out and sign back in.
  - ✅ If YES → Continue to next step

### Step 2: Check the Error Response Body

The console should now show the **exact error message** from the edge function:

```javascript
📥 Edge function response data: { error: "Missing authorization header" }
// or
📥 Edge function response data: { error: "Unauthorized: invalid token" }
// or
📥 Edge function response data: { error: "Forbidden: Only super admins..." }
```

**Common error messages and their meanings:**

| Error Message | Problem | Solution |
|--------------|---------|----------|
| `"Missing authorization header"` | Headers not being sent | **BUG** - Report with console logs |
| `"Unauthorized: invalid token"` | Token expired/invalid | Sign out, clear cache, sign in again |
| `"Forbidden: Only super admins can create admin users"` | You're not a super admin | See "Grant Super Admin Access" below |
| `"Internal server error"` | Edge function deployment issue | See "Deploy Edge Function" below |

---

## 🔧 FIXES TO TRY

### Fix 1: Grant Super Admin Access (Most Likely)

If you're getting `403 Forbidden: Only super admins can create admin users`, you need to grant yourself super admin access.

**Run this SQL in Supabase SQL Editor:**

```sql
-- Find your user ID first (check auth.users table for your email)
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';

-- Then grant super admin access (replace with your actual user_id)
UPDATE admin_users 
SET 
  is_super_admin = true,
  role = 'super_admin',
  permissions = '{
    "vendor_management": true,
    "order_management": true,
    "product_management": true,
    "finance_management": true,
    "analytics_monitoring": true
  }'::jsonb,
  updated_at = now()
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Verify the update
SELECT user_id, email, role, is_super_admin FROM admin_users WHERE user_id = 'YOUR_USER_ID_HERE';
```

### Fix 2: Deploy Edge Function

If you're getting `500 Internal Server Error` or the function doesn't respond:

```bash
cd dashboard
supabase login
supabase link --project-ref naesxujdffcmatntrlfr
supabase functions deploy create-admin
```

### Fix 3: Set Edge Function Secrets

The edge function needs environment variables to work:

```bash
supabase secrets set \
  SUPABASE_URL=https://your-dashboard.example.com \
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY \
  --project-ref naesxujdffcmatntrlfr
```

**Find your service role key:**
1. Go to https://your-database-admin.example
2. Click **Settings** (gear icon)
3. Click **API**
4. Copy the **service_role** key (NOT the anon key!)
5. Use it in the command above

### Fix 4: Clear Cache & Re-authenticate

```bash
# In browser console (F12):
localStorage.clear()
sessionStorage.clear()
location.reload()
```

Then sign in again and try creating an admin.

---

## 🧪 Manual Testing

### Test Edge Function Directly with curl

Replace `YOUR_TOKEN` with your actual auth token (get from browser console: `supabase.auth.getSession().then(s => console.log(s.data.session.access_token))`):

```bash
curl -X POST 'https://your-dashboard.example.com/api/functions/create-admin' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test-diagnostic@example.com",
    "password": "testpass123",
    "roleName": "admin",
    "permissions": {
      "vendor_management": false,
      "order_management": false,
      "product_management": false,
      "finance_management": false,
      "analytics_monitoring": false
    }
  }'
```

**Expected responses:**
- ✅ `200 OK` with `{ "success": true, "admin": {...} }` → Working!
- ❌ `401` with `{ "error": "..." }` → Auth issue
- ❌ `403` with `{ "error": "Forbidden..." }` → Not super admin
- ❌ `500` with `{ "error": "..." }` → Function deployment issue

---

## 📋 Quick Checklist

- [ ] Browser console shows `hasSession: true` and `hasToken: true`
- [ ] Edge function is deployed (`supabase functions deploy create-admin`)
- [ ] Secrets are set (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Your user has `is_super_admin = true` in `admin_users` table
- [ ] `admin_users` table exists with correct schema
- [ ] You've signed out and signed back in recently

---

## 🚨 Next Steps

1. **Refresh your browser** (Ctrl+Shift+R to hard refresh)
2. **Open browser console** (F12)
3. **Try creating an admin again**
4. **Copy the console output** and share it with me, specifically:
   - The `🔍 Session check:` line
   - The `📥 Edge function response status:` line  
   - The `📥 Edge function response data:` line

This will tell us EXACTLY what's wrong!
