# Vendor Catalog Rules - Implementation Guide

## Overview

The **Catalog Rules** module has been successfully integrated into the Vendor Dashboard as a read-only reference system. This implementation strictly follows the requirement that vendors can **view but never modify** catalog structures.

---

## Implementation Details

### 1. Location in Vendor Dashboard

**Sidebar Structure** (all existing items preserved):
```
Dashboard
Orders
Labels
Shippings
Returns
Inventory

Products (expandable)
  ├─ Manage Products
  └─ Catalog Rules   ← NEW READ-ONLY MODULE

US Warehouse
Test New Products
Finances
Analytics / Insights
Vendor Profile
Account Mgt
Notifications
Product Guidelines
Support
Sign Out
```

### 2. Component Architecture

**File**: `src/components/vendor/VendorCatalogRules.tsx`
**Route**: `/vendor/catalog-rules`

**Three-Tab Interface**:

#### Tab 1: Category Browser
- **Purpose**: Help vendors choose the correct category for products
- **Features**:
  - Full hierarchical tree view with expand/collapse
  - Parent → Child → Leaf category navigation
  - Search functionality across all categories
  - Visual indicators for leaf categories (can be assigned to products)
  - Featured category badges
  - Click-to-select with highlight
- **Restrictions**:
  - ✅ Browse only
  - ❌ No add/edit/delete
  - ❌ No reordering
  - ❌ No visibility toggles

#### Tab 2: Facets & Filters
- **Purpose**: Show required attributes for each category
- **Features**:
  - Select a category to view its facets
  - Display required vs optional facets
  - Show data types (text, number, select, etc.)
  - Display allowed values for select/multi-select facets
  - Color-coded: Red for required, Gray for optional
- **Workflow Integration**:
  - Informs manual product creation
  - Guides bulk upload CSV structure
  - Reduces product validation errors
- **Restrictions**:
  - ✅ View schema only
  - ❌ No facet creation
  - ❌ No value editing
  - ❌ No requirement overrides

#### Tab 3: Navigation & Visibility
- **Purpose**: Set vendor expectations
- **Content**:
  - Informational cards explaining centralized control
  - Best practices for product visibility
  - Guidance on category selection
  - Link to support for catalog questions
- **Key Message**:
  "All storefront navigation, category visibility, and featured placements are controlled by platform admin. Vendors select appropriate categories only."

---

## Data Flow (One-Way Read)

```
┌─────────────────────┐
│  Admin Dashboard    │
│  (Catalog Governance)│
│  - Create categories │
│  - Define facets     │
│  - Set navigation    │
└──────────┬──────────┘
           │ WRITE
           ▼
    ┌──────────────┐
    │   Database   │
    │  (categories)│
    │   (facets)   │
    └──────┬───────┘
           │ READ ONLY
           ▼
┌──────────────────────┐
│ Vendor Dashboard     │
│ (Catalog Rules)      │
│ - Browse categories  │
│ - Preview facets     │
│ - Reference only     │
└──────────────────────┘
```

**Critical Rule**: Vendor component uses **direct Supabase queries** to fetch catalog data. No vendor-side schema duplication.

---

## API Queries (Read-Only)

### Categories Query
```typescript
supabase
  .from('categories')
  .select('*')
  .eq('is_active', true)
  .order('level', { ascending: true })
  .order('display_order', { ascending: true })
```

### Category Facets Query
```typescript
supabase
  .from('category_facets')
  .select(`
    *,
    facet:facets(*)
  `)
  .eq('category_id', categoryId)
  .order('display_order', { ascending: true })
```

### Facet Values Query
```typescript
supabase
  .from('facet_values')
  .select('*')
  .in('facet_id', facetIds)
  .order('display_order', { ascending: true })
```

**Note**: All queries are SELECT only. No INSERT, UPDATE, or DELETE.

---

## UI/UX Features

### Visual Hierarchy
- **Tree Structure**: Indented levels show parent-child relationships
- **Expand/Collapse**: Click arrows to navigate subcategories
- **Selection State**: Emerald highlight for selected category
- **Leaf Indicators**: Green checkmark for assignable categories

### Search & Filter
- Real-time search across category names and slugs
- Instant results with highlighting
- Tree structure preserved during search

### Responsive Design
- Mobile-friendly collapsible menus
- Scrollable category tree (max-height: 600px)
- Touch-optimized expand/collapse controls

### Information Architecture
- Blue info banner: "Read-Only Reference"
- Color-coded facet requirements (red = required, gray = optional)
- Contextual help text throughout
- Best practice guidance cards

---

## Integration with Product Workflows

### Manual Product Creation
1. Vendor clicks "Add Product" in Manage Products
2. System displays category selector
3. Vendor can reference Catalog Rules for guidance
4. Selected category auto-loads required facets
5. Form validates against catalog rules

### Bulk Upload
1. Vendor clicks "Bulk Upload" in Manage Products
2. Selects target category
3. System generates CSV template with:
   - Standard product fields
   - Category-specific facet columns (from catalog rules)
4. Upload validates each row against rules
5. Errors displayed if rules violated

### Error Reduction
- Vendors preview requirements before creating products
- Reduces admin review cycles
- Fewer rejected products
- Better data quality

---

## Naming Conventions

| Context | Label |
|---------|-------|
| Admin Dashboard | **Catalog Governance** |
| Vendor Dashboard | **Catalog Rules** |
| API/Database | categories, facets, category_facets |

**Reason**: Different labels clarify the difference between admin control (governance) and vendor reference (rules).

---

## Security & Permissions

### Row Level Security (RLS)
- Categories table: READ access for authenticated vendors
- Facets table: READ access for authenticated vendors
- Category facets: READ access for authenticated vendors
- Facet values: READ access for authenticated vendors

### No Write Permissions
Vendors have **zero** write access to:
- ❌ categories
- ❌ facets
- ❌ facet_values
- ❌ category_facets
- ❌ Navigation settings

### Data Integrity
- Single source of truth: Admin Dashboard
- No vendor-side caching or duplication
- Real-time data from database
- Changes made by admin immediately visible to vendors

---

## Testing

### Test Scenarios

1. **Category Browsing**
   - Load Catalog Rules
   - Expand/collapse category tree
   - Search for categories
   - Select leaf categories
   - Verify selection UI

2. **Facet Preview**
   - Select a category with facets
   - View required facets (red indicators)
   - View optional facets (gray indicators)
   - Check facet value lists
   - Verify data type displays

3. **Navigation Info**
   - Read visibility explanation cards
   - Check best practices content
   - Verify support link

4. **Responsive Design**
   - Test on mobile viewport
   - Test on tablet viewport
   - Verify scrolling behavior
   - Check expand/collapse touch targets

5. **Read-Only Enforcement**
   - Verify no edit buttons
   - Confirm no add buttons
   - Ensure no delete options
   - Check no drag-and-drop reordering

---

## Future Enhancements

### Phase 2 (Optional)
- Export category tree as PDF reference
- Print-friendly facet checklists
- Bookmark favorite categories
- Recent categories history

### Phase 3 (Optional)
- Product validation preview tool
- Bulk upload template generator with live facets
- Category recommendation engine

**Note**: All enhancements must remain **read-only**. No vendor write operations.

---

## Maintenance

### When Admin Updates Catalog
1. Admin modifies categories/facets in Admin Dashboard
2. Changes immediately reflected in database
3. Vendor Catalog Rules shows updates in real-time
4. No vendor action required
5. No cache invalidation needed

### Support Requests
If vendors request:
- New categories
- Different facet requirements
- Catalog structure changes

**Response**: Direct to support ticket system. Only admins can modify catalog.

---

## Summary

✅ **Implemented**:
- Read-only Catalog Rules module under Products submenu
- Three-tab interface (Categories, Facets, Visibility)
- Complete category tree browser
- Facet requirement previews
- Vendor education content
- Mobile-responsive design
- Direct database queries (no duplication)

✅ **Preserved**:
- All existing vendor sidebar items
- Original menu order
- Existing product management workflows
- Admin-only catalog governance

✅ **Enforced**:
- Zero vendor write permissions
- Single source of truth (Admin Dashboard)
- One-way data flow (Admin → Vendor)
- Read-only UI throughout

---

**Status**: ✅ Ready for Production
**Last Updated**: February 3, 2026
**Component**: `VendorCatalogRules.tsx`
**Route**: `/vendor/catalog-rules`
