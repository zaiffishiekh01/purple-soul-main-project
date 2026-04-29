# Create Admin Edge Function Error - FIXED ✅

## Issue: 401 Unauthorized Error

**Error Message:** `Edge Function returned a non-2xx status code`

**Root Cause:** The Supabase client was not explicitly passing the authentication token when invoking the `create-admin` edge function.

## Solution Applied ✅

Updated `dashboard/src/hooks/useAdminPermissions.ts` to explicitly pass the auth token:

```typescript
// BEFORE (BROKEN)
const { data, error } = await supabase.functions.invoke('create-admin', {
  body: { email, password, roleName, permissions },
});

// AFTER (FIXED)
const { data: { session } } = await supabase.auth.getSession();
const { data, error } = await supabase.functions.invoke('create-admin', {
  body: { email, password, roleName, permissions },
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});
```

### Files Modified:
- ✅ `dashboard/src/hooks/useAdminPermissions.ts` - `createAdmin()` function
- ✅ `dashboard/src/hooks/useAdminPermissions.ts` - `deleteAdmin()` function

---

## Testing

1. **Refresh your browser** (clear cache if needed: Ctrl+Shift+R)
2. Go to Admin Dashboard → Admin Management
3. Click "Add Admin" button
4. Fill in the form and submit
5. Check browser console - you should see: `🔑 Invoking create-admin with auth token`
6. The admin should now be created successfully!

---

## If You Still Get Errors

### Check the Console Output

The improved error handling will now show specific messages:

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Not authenticated..." | No valid session | Sign out and sign back in |
| "You must be a Super Admin..." | Insufficient permissions | Update your role in `admin_users` table |
| "Edge function not deployed..." | Function not deployed | Run `supabase functions deploy create-admin` |

### Verify Your Session

Open browser console and run:
```javascript
// Check if you have a valid session
const session = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Token:', session.data?.session?.access_token);
```

You should see a valid JWT token. If not, sign out and sign back in.

---

## Original Troubleshooting Guide

## Error: "Edge Function returned a non-2xx status code"

This error occurs when the `create-admin` Supabase Edge Function returns an error status (4xx or 5xx).

---

## Quick Diagnosis

Run the diagnostic script:
```bash
node dashboard/scripts/diagnose-create-admin.js
```

---

## Common Causes & Solutions

### 1️⃣ **Not Logged In as Super Admin** (Most Common)

**Symptom:** Error message says "Forbidden: Only super admins can create admin users"

**Cause:** The currently logged-in user doesn't have `is_super_admin = true` in the `admin_users` table.

**Solution:**
1. Check your user in Supabase Dashboard → `admin_users` table
2. Verify `is_super_admin` column is `true` OR `role` is `'super_admin'`
3. If not, you need another super admin to grant you access, or manually update:
   ```sql
   UPDATE admin_users 
   SET is_super_admin = true, role = 'super_admin'
   WHERE user_id = 'YOUR_USER_ID';
   ```

---

### 2️⃣ **Edge Function Not Deployed**

**Symptom:** Generic "non-2xx status code" or "not found" error

**Cause:** The `create-admin` edge function hasn't been deployed to Supabase.

**Solution:**
```bash
cd dashboard
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy create-admin
```

**Verify deployment:**
- Go to Supabase Dashboard → Edge Functions
- Look for `create-admin` in the list

---

### 3️⃣ **Missing Environment Variables/Secrets**

**Symptom:** "Internal server error" or function fails during execution

**Cause:** The edge function needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets.

**Solution:**
```bash
supabase secrets set \
  SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY \
  --project-ref YOUR_PROJECT_REF
```

**Find these values:**
- `SUPABASE_URL`: Your project URL (Settings → API)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (Settings → API → Service Role Key)

⚠️ **Important:** Use the SERVICE ROLE key, not the anon key. The service role key bypasses RLS.

---

### 4️⃣ **Database Table Missing or Misconfigured**

**Symptom:** "DB error checking permissions" or "Failed to create admin record"

**Cause:** The `admin_users` table doesn't exist or has incorrect schema.

**Solution:**
Run this SQL in Supabase SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
```

---

### 5️⃣ **Authentication Token Expired**

**Symptom:** "Unauthorized: invalid token" or "Missing authorization header"

**Cause:** Your session token has expired.

**Solution:**
1. Sign out completely
2. Sign back in
3. Try creating the admin again

---

## Debugging Steps

### 1. Check Browser Console
Open DevTools (F12) → Console tab, then try creating an admin. Look for:
- `❌ create-admin edge function error:` - Shows the raw error
- `❌ Error data from function:` - Shows the response data

### 2. Check Edge Function Logs
```bash
supabase functions logs create-admin
```

This shows all execution logs for the function, including errors.

### 3. Test Edge Function Manually
```bash
# Get your auth token first (from browser console after login):
# localStorage.getItem('supabase.auth.token')

curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/create-admin' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "roleName": "admin",
    "permissions": {
      "vendor_management": true,
      "order_management": true,
      "product_management": true,
      "finance_management": true,
      "analytics_monitoring": true
    }
  }'
```

---

## Error Code Reference

| Status Code | Meaning | Solution |
|-------------|---------|----------|
| 400 | Bad Request | Check input fields (email, password, roleName) |
| 401 | Unauthorized | Re-authenticate, token expired |
| 403 | Forbidden | Not a super admin, need permission |
| 500 | Internal Server Error | Check edge function logs, DB connection |

---

## Verification Checklist

- [ ] Logged in as Super Admin (check `is_super_admin` in `admin_users`)
- [ ] Edge function deployed (`supabase functions deploy create-admin`)
- [ ] Secrets set (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] `admin_users` table exists with correct schema
- [ ] `get_admin_permissions` RPC function exists
- [ ] Browser console shows no authentication errors
- [ ] Edge function logs show no errors

---

## Related Files

- Edge Function: `dashboard/supabase/functions/create-admin/index.ts`
- Hook: `dashboard/src/hooks/useAdminPermissions.ts`
- Component: `dashboard/src/components/admin/AdminManagement.tsx`

---

## Getting Help

1. Run diagnostic: `node dashboard/scripts/diagnose-create-admin.js`
2. Check logs: `supabase functions logs create-admin`
3. Look at browser console for detailed error messages (now added to the hook)
4. Review this guide for your specific error message
