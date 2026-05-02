# CREATE-ADMIN 401 ERROR - ROOT CAUSE IDENTIFIED

## ✅ Problem Identified

**Other admin actions work** because they use direct Supabase database queries (`supabase.from()`).

**Create-admin fails** because it uses an **edge function that hasn't been deployed**.

---

## 🔧 Solution (Choose One)

### Option 1: Deploy the Edge Function (Recommended)

```bash
cd dashboard
supabase functions deploy create-admin --project-ref naesxujdffcmatntrlfr
```

**If you don't have Supabase CLI:**
1. Install it: `npm install -g supabase`
2. Login: `supabase login`
3. Deploy: `supabase functions deploy create-admin --project-ref naesxujdffcmatntrlfr`

**After deploying, set required secrets:**
```bash
supabase secrets set \
  SUPABASE_URL=https://your-dashboard.example.com \
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY \
  --project-ref naesxujdffcmatntrlfr
```

Find your service role key at:
https://your-database-admin.example/settings/api

---

### Option 2: Use Manual SQL (Quick Fix, No Edge Function Needed)

If you just need to create an admin **right now** without deploying anything:

#### Step 1: Create the auth user
In Supabase Dashboard → Authentication → Users → **Add User**
- Email: admin@example.com
- Password: yourpassword
- Auto Confirm User: ✅ (check this!)

#### Step 2: Get the user ID
Copy the UUID of the user you just created.

#### Step 3: Run this SQL
```sql
-- Replace with actual user ID and email
INSERT INTO admin_users (
  user_id,
  email,
  role,
  is_super_admin,
  permissions
) VALUES (
  'USER_UUID_HERE',                    -- Replace with actual UUID
  'admin@example.com',                 -- Replace with actual email
  'super_admin',                       -- Or 'admin', 'management'
  true,                                -- true for super admin
  '{
    "vendor_management": true,
    "order_management": true,
    "product_management": true,
    "finance_management": true,
    "analytics_monitoring": true
  }'::jsonb
);
```

---

### Option 3: Deploy via Supabase Dashboard (No CLI Required)

1. Go to https://your-database-admin.example
2. Click **Edge Functions** in the left sidebar
3. Click **New Function**
4. Confirm `dashboard/app/api/functions/[name]/route.ts` includes the `create-admin` branch (current source of truth).
5. Name it `create-admin`
6. Deploy it

**Then set the secrets:**
1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add:
   - `SUPABASE_URL` = `https://your-dashboard.example.com`
   - `SUPABASE_SERVICE_ROLE_KEY` = (your service role key from API settings)

---

## 📋 Verification Steps

After deploying, test it:

1. **Refresh your browser** (Ctrl+Shift+R)
2. **Open browser console** (F12)
3. **Try creating an admin** from the Admin Management page
4. **Check console logs**:
   ```
   📤 Request details: { hasAuthHeader: true, ... }
   📥 Edge function response status: 200
   📥 Edge function response data: { success: true, ... }
   ```

---

## 🎯 Quick Summary

| What Works | Why |
|------------|-----|
| Other admin actions | Using `supabase.from()` - direct DB queries |
| Create-admin | ❌ Using edge function that's NOT deployed |

**Fix:** Deploy the edge function OR use manual SQL to create admins.
