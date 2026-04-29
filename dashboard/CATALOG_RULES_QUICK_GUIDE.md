# Catalog Rules - Quick Reference Guide

## What Was Implemented

### New Vendor Dashboard Feature: Catalog Rules (Read-Only)

**Location**: Products → Catalog Rules

**Purpose**: Help vendors correctly list products by providing a read-only reference to the platform's catalog structure.

---

## Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ VENDOR DASHBOARD SIDEBAR                                    │
├─────────────────────────────────────────────────────────────┤
│ 📊 Dashboard                                                │
│ 🛒 Orders                                                   │
│ 🏷️  Labels                                                   │
│ 🚚 Shippings                                                │
│ 🔄 Returns                                                  │
│ 📦 Inventory                                                │
│                                                             │
│ ▼ 📦 Products                                               │
│    ├─ 📦 Manage Products                                    │
│    └─ 📖 Catalog Rules ◄── NEW (READ-ONLY)                 │
│                                                             │
│ 🏭 US Warehouse                                             │
│ 🧪 Test New Products                                        │
│ 💰 Finances                                                 │
│ 📊 Analytics / Insights                                     │
│ 👤 Vendor Profile                                           │
│ ⚙️  Account Mgt                                              │
│ 🔔 Notifications                                            │
│ 📘 Product Guidelines                                       │
│ 🆘 Support                                                  │
│ 🚪 Sign Out                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Three-Tab Interface

### Tab 1: Category Browser 🗂️

**What Vendors See**:
```
┌──────────────────────────────────────────────┐
│ 🔍 Search categories...                      │
├──────────────────────────────────────────────┤
│ 🏠 Home Decor                                │
│   ▶ 🛋️ Cushions & Pillows ✓ (leaf)          │
│   ▶ 🪑 Table Decor ✓ (leaf)                  │
│                                              │
│ 👔 Fashion ⭐ Featured                        │
│   ▶ 🧕 Modest Clothing ✓ (leaf)              │
│   ▶ 🧢 Accessories ✓ (leaf)                  │
│                                              │
│ 📚 Books & Media                             │
│   ▶ 📖 Islamic Literature ✓ (leaf)           │
│   ▶ 🎧 Audio Books ✓ (leaf)                  │
└──────────────────────────────────────────────┘
```

**Features**:
- ✅ Browse full category tree
- ✅ Expand/collapse navigation
- ✅ Search by name or slug
- ✅ Green checkmark = can assign to products (leaf category)
- ✅ Yellow badge = featured on homepage
- ❌ **No editing capabilities**

---

### Tab 2: Facets & Filters 🏷️

**What Vendors See** (when category selected):

```
┌──────────────────────────────────────────────────────────┐
│ Selected: 🧕 Modest Clothing                             │
├──────────────────────────────────────────────────────────┤
│ REQUIRED ATTRIBUTES ⚠️                                    │
│                                                          │
│ ⚠️ Size                                                   │
│   Type: select                                           │
│   Values: XS, S, M, L, XL, XXL, XXXL                    │
│                                                          │
│ ⚠️ Material                                               │
│   Type: select                                           │
│   Values: Cotton, Silk, Polyester, Linen, Wool          │
│                                                          │
│ ⚠️ Color                                                  │
│   Type: select                                           │
│   Values: Black, White, Navy, Beige, Gray, Brown        │
├──────────────────────────────────────────────────────────┤
│ OPTIONAL ATTRIBUTES ℹ️                                    │
│                                                          │
│ ℹ️ Pattern                                                │
│   Type: select                                           │
│   Values: Solid, Floral, Geometric, Embroidered         │
│                                                          │
│ ℹ️ Season                                                 │
│   Type: multi_select                                     │
│   Values: Spring, Summer, Fall, Winter                  │
└──────────────────────────────────────────────────────────┘
```

**How This Helps**:
- ✅ Shows exactly what attributes are required
- ✅ Displays allowed values for each facet
- ✅ Prevents validation errors during product creation
- ✅ Guides bulk upload CSV structure
- ❌ **No ability to modify facets or values**

---

### Tab 3: Navigation & Visibility 👁️

**What Vendors See**:

```
┌───────────────────────────────────────────────────────────┐
│ 👁️ CENTRALLY MANAGED NAVIGATION                          │
├───────────────────────────────────────────────────────────┤
│ All storefront navigation, category visibility, and       │
│ featured placements are controlled by the platform admin. │
│                                                           │
│ What this means for you:                                  │
│ • Choose the most accurate leaf category                  │
│ • Your product appears in correct sections automatically  │
│ • Featured categories managed centrally for consistency   │
│ • You cannot control navigation menu structure            │
├───────────────────────────────────────────────────────────┤
│ ✅ BEST PRACTICES FOR VISIBILITY                          │
├───────────────────────────────────────────────────────────┤
│ 1. Choose the Right Category                              │
│    Select the most specific category for your product     │
│                                                           │
│ 2. Fill in All Required Facets                            │
│    Complete all red-marked attributes                     │
│                                                           │
│ 3. Use Optional Facets When Relevant                      │
│    Improves filtering and searchability                   │
│                                                           │
│ 4. Quality Product Information                            │
│    Clear titles, detailed descriptions, good images       │
├───────────────────────────────────────────────────────────┤
│ ℹ️ QUESTIONS ABOUT CATALOG?                               │
├───────────────────────────────────────────────────────────┤
│ If you need categories or attributes that aren't          │
│ available, please contact support.                        │
│                                                           │
│ [Contact Support Button]                                  │
└───────────────────────────────────────────────────────────┘
```

---

## How Vendors Use This

### Scenario 1: Adding a New Product Manually

1. Vendor goes to **Products → Manage Products**
2. Clicks **"Add Product"** button
3. Before filling form, checks **Catalog Rules** to verify:
   - Correct category to use
   - Required attributes needed
   - Allowed values for each attribute
4. Returns to Add Product form
5. Selects category (system auto-loads required facets)
6. Fills in all fields following catalog rules
7. Product saves successfully (no validation errors)

---

### Scenario 2: Bulk Upload Preparation

1. Vendor goes to **Catalog Rules → Facets & Filters**
2. Selects target category (e.g., "Modest Clothing")
3. Reviews required facets:
   - Size (required, select)
   - Material (required, select)
   - Color (required, select)
4. Notes allowed values for each
5. Returns to **Products → Manage Products → Bulk Upload**
6. Selects same category
7. System generates CSV template with exact columns from catalog rules
8. Vendor fills CSV with valid values
9. Upload succeeds with zero errors

---

### Scenario 3: Understanding Visibility

1. Vendor wonders why their category doesn't appear in nav menu
2. Goes to **Catalog Rules → Navigation & Visibility**
3. Reads: "Navigation is centrally managed by admin"
4. Understands this is intentional platform design
5. Focuses on proper categorization instead
6. Fewer support tickets about navigation

---

## Key Principles (Enforced)

### ✅ DO (Vendors Can):
- Browse all active categories
- View hierarchical structure
- Search for categories
- Preview facet requirements
- See allowed attribute values
- Read best practice guidance

### ❌ DO NOT (Vendors Cannot):
- Create new categories
- Edit category names or descriptions
- Delete categories
- Reorder categories
- Change navigation visibility
- Add or modify facets
- Change facet requirements
- Edit allowed values
- Override catalog rules

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                          │
│               (Catalog Governance - WRITE)                  │
│                                                             │
│  • Create/Edit/Delete Categories                            │
│  • Define Facets & Requirements                             │
│  • Set Navigation & Visibility                              │
│  • Manage Featured Status                                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ WRITES TO
                  ▼
          ┌───────────────┐
          │   DATABASE    │
          │               │
          │  categories   │
          │  facets       │
          │  facet_values │
          │  category_    │
          │    facets     │
          └───────┬───────┘
                  │
                  │ READ ONLY
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  VENDOR DASHBOARD                           │
│              (Catalog Rules - READ ONLY)                    │
│                                                             │
│  • Browse Categories                                        │
│  • View Facet Requirements                                  │
│  • See Allowed Values                                       │
│  • Reference Best Practices                                 │
└─────────────────────────────────────────────────────────────┘
```

**Single Source of Truth**: Admin Dashboard
**Vendor Access**: Read-only reference
**No Duplication**: Direct database queries

---

## Technical Implementation

### Files Created/Modified:

1. **New Component**: `src/components/vendor/VendorCatalogRules.tsx`
   - 520+ lines of read-only catalog UI
   - Three-tab interface
   - Category tree browser
   - Facet preview system
   - Information cards

2. **Modified**: `src/components/DashboardLayout.tsx`
   - Added nested menu support
   - Products submenu with Catalog Rules
   - Expand/collapse functionality
   - Preserved all existing menu items

3. **Modified**: `src/App.tsx`
   - Added route: `/vendor/catalog-rules`
   - Imported VendorCatalogRules component
   - Integrated with vendor routing

4. **Database**: Migration applied
   - Added navigation visibility columns to categories table
   - No new tables (uses existing catalog structure)

---

## Security & Permissions

### RLS Policies (Read-Only)
```sql
-- Vendors can view active categories
CREATE POLICY "Vendors can view active categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Vendors can view facets (when implemented)
CREATE POLICY "Vendors can view facets"
  ON facets FOR SELECT
  TO authenticated
  USING (true);

-- NO INSERT, UPDATE, or DELETE policies for vendors
```

### Enforcement Points:
- ✅ UI has zero edit controls
- ✅ All queries are SELECT only
- ✅ RLS prevents write operations
- ✅ API endpoints are read-only
- ✅ No vendor-side schema duplication

---

## Testing Checklist

- [x] Sidebar shows Products submenu
- [x] Catalog Rules appears under Products
- [x] All existing menu items preserved
- [x] Route `/vendor/catalog-rules` works
- [x] Category tree displays correctly
- [x] Expand/collapse categories works
- [x] Search filters categories
- [x] Facet preview shows for selected category
- [x] Required facets marked in red
- [x] Optional facets marked in gray
- [x] Navigation info tab displays
- [x] Mobile responsive design
- [x] No edit buttons anywhere
- [x] Build completes successfully

---

## Support & Maintenance

### Vendor Questions:
**"Can I add a new category?"**
→ No, contact admin via support ticket

**"Why isn't my category in the navigation?"**
→ Navigation is centrally managed by admin

**"Can I change which facets are required?"**
→ No, facet requirements are platform-controlled

**"How do I suggest a new facet?"**
→ Submit request through support system

### Admin Actions:
When admin updates catalog:
1. Changes in Admin Dashboard
2. Database updated immediately
3. Vendor Catalog Rules reflects changes in real-time
4. No vendor action needed
5. No cache to invalidate

---

## Summary

✅ **Successfully Implemented**:
- Read-only Catalog Rules module
- Nested Products menu
- Three-tab reference interface
- Category tree browser
- Facet requirement previews
- Vendor education content
- Complete documentation

✅ **Preserved Existing Functionality**:
- All vendor menu items intact
- Original menu order maintained
- Product management unchanged
- Admin catalog control exclusive

✅ **Security Enforced**:
- Zero vendor write permissions
- UI has no edit controls
- Database RLS enforces read-only
- Single source of truth maintained

**Status**: ✅ Production Ready
**Last Updated**: February 3, 2026
