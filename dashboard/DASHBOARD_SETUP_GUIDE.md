# Dashboard Setup & Troubleshooting Guide

## Quick Start

### 1. Start the Dev Server
```bash
cd dashboard
npm run dev
```

The server should start on `http://localhost:5173` (or another port if 5173 is busy).

### 2. Test Supabase Connection
Open `dashboard/test-supabase-connection.html` in your browser to verify:
- ✓ Supabase credentials are correct
- ✓ Database tables exist
- ✓ Authentication works
- ✓ Vendor creation works

### 3. Test the Full Flow

#### Sign Up Flow:
1. Go to `http://localhost:5173/`
2. Click "Vendor" role
3. Click "Sign Up"
4. Enter email and password (min 6 characters)
5. **Check browser console** (F12) for debug logs

#### What Should Happen:
1. ✓ User account created in Supabase Auth
2. ✓ Vendor record created in `vendors` table with `is_approved: false`
3. ✓ Redirected to "Pending Approval" screen
4. ⏳ Wait for admin approval before accessing dashboard

#### Sign In Flow (Existing User):
1. Go to `http://localhost:5173/login/vendor`
2. Enter credentials
3. **If approved**: See dashboard
4. **If pending**: See pending approval screen

## Debugging "Loading vendor data..." Issue

If you see "Loading vendor data..." for too long, check:

### Browser Console Logs (F12)
Look for:
- 🔍 `Fetching vendor for user:` - Query started
- 📦 `Vendor query result:` - Query completed
- ✅ `Vendor found:` or `New vendor created:` - Success
- ❌ `Error fetching vendor:` - Problem detected

### Common Issues & Fixes:

#### Issue 1: "Missing Supabase environment variables"
**Fix**: Ensure `.env` file exists with:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Issue 2: RLS Policy Blocking
**Symptoms**: Error 401 or 403 in console
**Fix**: 
1. Check Supabase dashboard → Authentication → Policies
2. Ensure vendors table has INSERT policy for authenticated users
3. Run migration: `20260409000000_fix_vendor_schema.sql`

#### Issue 3: Database Tables Missing
**Fix**: Run all migrations in `supabase/migrations/` folder
```bash
# Using Supabase CLI
supabase db push
```

#### Issue 4: Infinite Loading Loop
**Check**:
1. Open browser console
2. Look for repeated "Fetching vendor" logs
3. Check if `userId` is changing (causing re-renders)

**Fix**: Already fixed in updated `useVendor.ts` with:
- Request deduplication via `isFetchingRef`
- Better error handling
- Detailed console logging

## Database Schema

### Vendors Table Columns:
```sql
- id (uuid, auto-generated)
- user_id (uuid, from auth.users)
- business_name (text)
- business_type (text)
- contact_email (text)
- contact_phone (text)
- address (jsonb)
- tax_id (text)
- status (text): 'pending', 'active', 'suspended'
- logo_url (text)
- is_approved (boolean): false by default
- approved_at (timestamptz)
- approved_by (uuid)
- can_view_customer_phone (boolean)
- can_view_customer_email (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

## Admin Approval Flow

To approve a vendor:
1. Sign in as admin (must exist in `admin_users` table)
2. Go to `/admin/vendors`
3. Find pending vendor
4. Click "Approve"

Or directly in Supabase SQL Editor:
```sql
-- Find your user ID first
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then approve the vendor
UPDATE vendors 
SET is_approved = true, approved_at = now()
WHERE user_id = 'YOUR-USER-ID-HERE';
```

## Testing Checklist

- [ ] Dev server starts without errors
- [ ] Can access login page
- [ ] Can sign up new vendor account
- [ ] Vendor record created in database
- [ ] See "Pending Approval" screen after signup
- [ ] Can sign in with existing account
- [ ] Approved vendor sees dashboard
- [ ] Unapproved vendor sees pending screen
- [ ] Console shows clear debug logs

## Files Modified

1. **`dashboard/src/hooks/useVendor.ts`**
   - Added detailed console logging
   - Better error handling
   - Prevents duplicate requests
   - Sets proper defaults for new vendors

2. **`dashboard/src/App.tsx`**
   - Enhanced loading messages
   - Debug logging for vendor state
   - Better UX during loading

3. **`dashboard/supabase/migrations/20260409000000_fix_vendor_schema.sql`**
   - Adds missing columns
   - Ensures proper defaults
   - Updates status for pending vendors

## Next Steps

1. **Apply the migration** to your Supabase database
2. **Test with the HTML test page** to verify connection
3. **Try signup/login** and check browser console
4. **Approve a vendor** to test dashboard access

## Need More Help?

Check these console logs:
- 🟡 AuthProvider: Authentication state
- 🔵 VendorShell: Vendor loading state
- 🔍 useVendor: Database queries

All errors are logged with ❌ emoji for easy spotting.
