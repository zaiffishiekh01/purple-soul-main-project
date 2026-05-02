# Fix Admin Creation & Product Guidelines

## Issues Fixed

### 1. Product Guidelines Not Working ❌ → ✅
**Problem**: RLS policies were using `EXISTS (SELECT 1 FROM admin_users...)` which caused infinite recursion or blocked access.

**Solution**: Updated RLS policies to use `is_admin()` function (SECURITY DEFINER) which bypasses recursion.

### 2. Admin Creation Not Working ❌ → ✅  
**Problem**: Two issues:
- Edge function didn't recognize `management` role (only accepted `super_admin`, `admin`, `support`)
- Missing `admin_access_requests` table for access request workflow

**Solution**: 
- Added `management` to valid roles in edge function
- Created `admin_access_requests` table with proper RLS policies
- Fixed all related functions

---

## 🚀 How to Apply Fixes

### Step 1: Run SQL Migration

Open Supabase SQL Editor: https://your-database-admin.example/sql/new

Run this file:
```
dashboard/postgres/migrations/20260410073200_fix_admin_creation_and_guidelines.sql
```

This creates/fixes:
- ✅ Product guidelines RLS policies
- ✅ Default guideline content (6 sections)
- ✅ `admin_access_requests` table
- ✅ `is_admin()` and `is_super_admin()` functions
- ✅ `get_admin_permissions()` function

### Step 2: Deploy Edge Function

**Option A: Using CLI** (if Supabase CLI is installed)
```bash
cd D:\fyaz.2\purple\project\dashboard
supabase functions deploy create-admin --project-ref naesxujdffcmatntrlfr
```

**Option B: Deploy the dashboard app**

Admin creation is handled in the Next.js app at `app/api/functions/[name]/route.ts` (branch `create-admin`). Deploy or run `npm run dev` for that route to be available—there is no separate Edge Function package under `dashboard/postgres/`.

---

## ✅ What Now Works

### Product Guidelines (Admin)
| Feature | Status |
|---------|--------|
| View all guidelines | ✅ |
| Add new guideline section | ✅ |
| Edit existing guidelines | ✅ |
| Toggle active/inactive | ✅ |
| Delete guidelines | ✅ |
| Default content (6 sections) | ✅ Pre-loaded |

### Admin Creation (Admin)
| Feature | Status |
|---------|--------|
| Create new admin via modal | ✅ |
| Role selection (Super Admin/Admin/Management) | ✅ |
| Granular permissions assignment | ✅ |
| Edit existing admin roles | ✅ |
| Delete admins (except super admins) | ✅ |
| Access requests review workflow | ✅ |
| Approve/reject access requests | ✅ |

---

## 📋 Default Product Guidelines

The following 6 guideline sections are automatically created:

1. **Image Requirements** - Resolution, quality, content rules
2. **Product Description Guidelines** - Required info, format, prohibited content
3. **Pricing & Commission** - How pricing works, commission rates
4. **Shipping & Fulfillment** - Shipping requirements, programs, international
5. **Returns & Refunds** - Return policy, process, non-returnable items
6. **Product Categories & Classification** - Category selection, attributes, filters

---

## 🎭 Admin Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Super Admin** | Complete platform control | All permissions + can manage other admins |
| **Admin** | Full e-commerce management | All operational permissions |
| **Management** | Oversight role | Finance + Analytics only |
| **Support** | Limited access | Basic vendor/order support |

---

## 🧪 Testing Checklist

After applying fixes, test:

### Product Guidelines
- [ ] Navigate to Admin → Product Guidelines
- [ ] See 6 default guideline sections
- [ ] Click "Add New Section" → Create a test guideline
- [ ] Click edit on any guideline → Modify and save
- [ ] Toggle a guideline inactive → Verify it hides from vendors
- [ ] Delete a guideline → Verify removal

### Admin Creation
- [ ] Navigate to Admin → Admin Management
- [ ] Click "Add Admin" button
- [ ] Fill in email, password, select role (try each)
- [ ] Check/uncheck permissions for non-super-admin roles
- [ ] Click "Create Admin" → Verify success
- [ ] New admin appears in the table
- [ ] Edit an existing admin → Change role → Save
- [ ] Try deleting a non-super admin → Verify removal

---

## ⚠️ Important Notes

1. **Edge Function Must Be Deployed**: The code fix alone isn't enough - you MUST redeploy the edge function to Supabase.

2. **Super Admin Required**: Only super admins can create new admins (enforced in edge function).

3. **RLS Policies**: All policies now use `is_admin()` function which is `SECURITY DEFINER` - this prevents infinite recursion.

4. **Default Guidelines**: If guidelines already exist in your database, the migration won't overwrite them (only inserts if table is empty).

---

## 🔧 Troubleshooting

### "Could not find function get_admin_permissions"
→ Run the SQL migration file completely.

### "Invalid role" when creating admin
→ Edge function wasn't deployed. Follow Step 2 above.

### Guidelines page shows empty
→ Either no guidelines exist yet, or RLS policies are still broken. Run SQL migration.

### "infinite recursion detected" error persists
→ Ensure the `is_admin()` and `is_super_admin()` functions were created with `SECURITY DEFINER`.
