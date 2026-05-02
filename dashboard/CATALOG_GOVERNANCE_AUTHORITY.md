# CATALOG GOVERNANCE - AUTHORITATIVE SYSTEM

## ⚠️ CRITICAL: Single Source of Truth

This Admin + Vendor Dashboard project is the **ONLY** place where catalog governance exists.

**DO NOT** recreate or duplicate catalog structure, filters, or navigation in any other project.

---

## Architecture Authority

```
┌─────────────────────────────────────────────────────────────┐
│         THIS PROJECT - CATALOG GOVERNANCE AUTHORITY         │
│                                                             │
│  ┌─────────────────────┐      ┌──────────────────────┐    │
│  │  ADMIN DASHBOARD    │      │  VENDOR DASHBOARD    │    │
│  │  (Full Control)     │      │  (Read-Only Access)  │    │
│  │                     │      │                      │    │
│  │  • Create/Edit/     │      │  • Browse Catalog    │    │
│  │    Delete Categories│      │    Rules submenu     │    │
│  │  • Manage Facets    │      │  • View Required     │    │
│  │  • Assign Filters   │      │    Facets            │    │
│  │  • Control Nav      │      │  • Understand Rules  │    │
│  │  • Set Visibility   │      │  • NO Editing        │    │
│  └──────────┬──────────┘      └──────────┬───────────┘    │
│             │                            │                │
│             └────────────┬───────────────┘                │
│                          ▼                                │
│                   ┌─────────────┐                         │
│                   │  DATABASE   │                         │
│                   │             │                         │
│                   │ • categories│                         │
│                   │ • facets    │                         │
│                   │ • mappings  │                         │
│                   └──────┬──────┘                         │
└──────────────────────────┼──────────────────────────────┘
                           │
                           │ EXPOSE VIA APIs
                           ▼
              ┌────────────────────────┐
              │   EXTERNAL CONSUMERS   │
              │                        │
              │  • Storefront Apps     │
              │  • Mobile Apps         │
              │  • Partner Systems     │
              │  • Any External Client │
              └────────────────────────┘
```

---

## Administrative Control (Admin Dashboard)

### Full CRUD Authority

Admin Dashboard has **COMPLETE** control over:

#### 1. Category Hierarchy
- ✅ Create root, intermediate, and leaf categories
- ✅ Define parent_id relationships (tree structure)
- ✅ Set category metadata (name, slug, icon, description)
- ✅ Control display_order for sorting
- ✅ **Enforce Rule**: Only leaf categories are selectable for products
- ✅ Edit and delete categories
- ✅ Reorganize hierarchy

#### 2. Facets & Filters
- ✅ Create facet definitions (Size, Color, Material, etc.)
- ✅ Define data types (text, number, boolean, select, multi_select)
- ✅ Create and manage facet values
- ✅ Organize facets into groups
- ✅ Set global defaults (is_required, display_order)
- ✅ Edit and delete facets

#### 3. Category-Facet Mappings
- ✅ Assign facets to specific categories
- ✅ Mark facets as required or optional per category
- ✅ Set category-specific display_order
- ✅ Override global facet settings per category
- ✅ Remove facet assignments

#### 4. Navigation Control
- ✅ Control show_in_navigation flag per category
- ✅ Set featured categories (is_featured)
- ✅ Define navigation structure and order
- ✅ Create static navigation links (About, Contact, etc.)
- ✅ Control visibility of entire branches

### Admin UI Components

**Location**: Admin Dashboard section

**Components**:
- `AdminCategories.tsx` - Category CRUD
- `AdminFacets.tsx` - Facet management
- `AdminFacetValues.tsx` - Value management
- `AdminFacetGroups.tsx` - Group organization
- `AdminCategoryFacets.tsx` - Category-facet assignments
- `AdminNavigation.tsx` - Navigation settings

**Database Access**: Full INSERT, UPDATE, DELETE, SELECT

---

## Vendor Access (Vendor Dashboard)

### Read-Only Reference

Vendors have **RESTRICTED** access via "Catalog Rules" submenu:

#### Location
```
Vendor Dashboard
  └── Products (main menu)
      └── Catalog Rules (submenu) ← READ-ONLY
```

#### Vendor Capabilities

**✅ CAN DO:**
- Browse full category hierarchy
- View leaf categories (assignable to products)
- Preview required facets for each category
- Understand optional facets
- See facet data types and allowed values
- Understand navigation visibility rules
- Reference catalog structure for product listing

**❌ CANNOT DO:**
- Create new categories
- Edit category names, icons, or metadata
- Delete categories
- Reorder categories
- Change parent_id relationships
- Create or edit facets
- Assign facets to categories
- Change required/optional status
- Modify navigation visibility
- Add or edit facet values
- Change display order

#### Vendor UI Component

**File**: `src/components/vendor/VendorCatalogRules.tsx`

**Features**:
- Tab 1: Category Browser (hierarchical tree view)
- Tab 2: Facets & Filters (category-specific preview)
- Tab 3: Navigation & Visibility (informational guide)

**Implementation**:
- No form inputs (read-only display)
- No save/edit/delete buttons
- No drag-and-drop reordering
- No toggle switches
- Pure data visualization

**Database Access**: SELECT-only queries via RLS policies

---

## Public APIs (External Consumers)

### Three Read-Only Endpoints

All APIs are **PUBLIC** and **READ-ONLY** (GET methods only).

#### 1. GET /get-catalog-navigation
**Purpose**: Storefront menu structure
**Returns**: Navigation tree, featured categories, static links
**Auth**: None required (public access)
**CORS**: Enabled

#### 2. GET /get-catalog-taxonomy
**Purpose**: Complete category hierarchy
**Returns**: Tree structure, leaf categories, flat list
**Auth**: None required (public access)
**CORS**: Enabled

#### 3. GET /get-catalog-facets
**Purpose**: Filters and product attributes
**Returns**: Facet groups, values, category mappings
**Auth**: None required (public access)
**CORS**: Enabled

### API Characteristics

- ✅ Read-only (GET only)
- ✅ Public access (no JWT required)
- ✅ CORS enabled for cross-origin requests
- ✅ Real-time data (no stale cache)
- ✅ Consistent JSON response format
- ✅ Comprehensive error handling
- ❌ No POST/PUT/DELETE methods
- ❌ No write operations
- ❌ No mutation endpoints

---

## Database Authority

### Authoritative Tables

These tables live ONLY in this project's database:

```sql
categories             -- Category hierarchy and metadata
facets                 -- Filter/attribute definitions
facet_values           -- Allowed values for facets
facet_groups           -- Facet organization
category_facets        -- Category-to-facet mappings
navigation_links       -- Static menu items
```

### Access Control via RLS

**Admin Users**:
```sql
-- Full CRUD access
SELECT, INSERT, UPDATE, DELETE on all catalog tables
```

**Vendor Users**:
```sql
-- Read-only access
SELECT only on catalog tables
NO INSERT, UPDATE, DELETE permissions
```

**Public APIs**:
```sql
-- Read-only access to active records
SELECT WHERE is_active = true
NO authentication required
```

### Data Flow

```
Admin Dashboard (WRITE)
         ↓
    Database (STORE)
         ↓
    ┌────┴────┐
    ▼         ▼
Vendors     Public APIs (READ)
```

**One-Way Flow**: Admin → Database → Consumers

**No Reverse Flow**: Consumers cannot write back to database

---

## Rules & Constraints

### 1. Leaf Category Rule

**Definition**: Only categories without children can have products assigned.

**Enforcement**:
- Database: `is_leaf` computed field
- Admin UI: Visual indicators
- Vendor UI: Only leaf categories selectable in product forms
- APIs: `is_leaf: true/false` flag in responses

**Example**:
```
Fashion (level 0, is_leaf=false)
  └── Modest Clothing (level 1, is_leaf=false)
      └── Abayas (level 2, is_leaf=true) ← Products can be assigned here
```

### 2. Required Facets Rule

**Definition**: Categories can have required facets that must be filled when listing products.

**Enforcement**:
- Database: `category_facets.is_required = true`
- Admin UI: Checkbox for required status
- Vendor UI: Red indicators for required facets
- Product Form: Validation fails if required facets missing

**Example**:
```
Category: Modest Clothing
  Required Facets:
    - Size (select: XS, S, M, L, XL)
    - Material (select: Cotton, Silk, Polyester)
    - Color (select: predefined colors)
  Optional Facets:
    - Pattern (select: Solid, Striped, Floral)
    - Style (select: Casual, Formal)
```

### 3. Navigation Visibility Rule

**Definition**: Admin controls which categories appear in storefront navigation.

**Enforcement**:
- Database: `categories.show_in_navigation = true/false`
- Admin UI: Toggle switch per category
- Navigation API: Filters by `show_in_navigation = true`
- Taxonomy API: Returns all categories regardless of flag

**Example**:
```
Books (show_in_navigation=true) ← Appears in menu
  └── Islamic Literature (show_in_navigation=false) ← Hidden from menu
      └── Quran Translations (show_in_navigation=true) ← Appears in menu
```

### 4. Featured Category Rule

**Definition**: Admin can mark categories as featured for homepage display.

**Enforcement**:
- Database: `categories.is_featured = true/false`
- Admin UI: Toggle switch per category
- Navigation API: Returns `featured` array
- Vendor UI: Yellow badge indicator

---

## Anti-Patterns (DO NOT DO)

### ❌ Duplication
**NEVER** recreate catalog tables in other databases:
```sql
-- DON'T DO THIS in storefront database:
CREATE TABLE storefront_categories (...)
```

**Why**: Single source of truth violated, sync issues, data conflicts

### ❌ Local Schema Copies
**NEVER** copy category/facet definitions to other codebases:
```javascript
// DON'T DO THIS in storefront code:
const categories = [
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Books', slug: 'books' }
];
```

**Why**: Static data becomes stale, admin changes don't propagate

### ❌ Storefront-Side Catalog Management
**NEVER** build category/facet management UI in storefront:
```jsx
// DON'T DO THIS in storefront:
<CategoryEditor onSave={saveCategory} />
```

**Why**: Breaks authority model, creates conflicting sources of truth

### ❌ Manual Sync Scripts
**NEVER** create scripts to sync catalog data between systems:
```bash
# DON'T DO THIS:
./sync-categories-from-admin-to-storefront.sh
```

**Why**: Adds complexity, prone to errors, defeats API purpose

### ❌ Vendor Write Access
**NEVER** give vendors ability to modify catalog structure:
```jsx
// DON'T DO THIS in vendor dashboard:
<button onClick={createCategory}>Add Category</button>
```

**Why**: Vendors are consumers, not administrators of catalog

---

## Integration Pattern (Correct Approach)

### External Storefront Integration

```javascript
// ✅ CORRECT: Fetch from authoritative APIs
class StorefrontCatalog {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getNavigation() {
    const response = await fetch(`${this.apiBaseUrl}/api/catalog/navigation`);
    return response.json();
  }

  async getTaxonomy() {
    const response = await fetch(`${this.apiBaseUrl}/api/catalog/taxonomy`);
    return response.json();
  }

  async getFacets(categoryId) {
    const response = await fetch(
      `${this.apiBaseUrl}/api/catalog/facets?category_id=${categoryId}`
    );
    return response.json();
  }
}

// Usage in storefront (origin only — paths are /api/catalog/*)
const catalog = new StorefrontCatalog('https://your-dashboard.example.com');

// Get navigation for header
const { data: nav } = await catalog.getNavigation();
renderHeader(nav.navigation);

// Get taxonomy for category browser
const { data: taxonomy } = await catalog.getTaxonomy();
renderCategoryBrowser(taxonomy.tree);

// Get facets for filter sidebar
const { data: facets } = await catalog.getFacets(currentCategoryId);
renderFilters(facets.category_details);
```

**Key Points**:
- ✅ Always fetch from APIs (never hardcode)
- ✅ Cache responses client-side (1 hour TTL recommended)
- ✅ Respect API response structure
- ✅ Handle errors gracefully
- ✅ Never attempt to write back

---

## Change Management

### How Admin Changes Propagate

```
1. Admin modifies category/facet in Admin Dashboard
         ↓
2. Database record updated immediately
         ↓
3. Next API call returns updated data
         ↓
4. Vendor Dashboard shows update instantly
         ↓
5. Storefront cache expires (TTL)
         ↓
6. Storefront fetches fresh data
         ↓
7. Users see updated catalog
```

**Propagation Time**:
- Database: Immediate (< 1ms)
- Vendor Dashboard: Immediate (real-time queries)
- Public APIs: Immediate (no cache on server)
- Storefront: Up to cache TTL (typically 1 hour)

**No Manual Steps Required**: Changes propagate automatically

---

## Validation & Testing

### Admin Validation
- Category slug uniqueness
- Valid parent_id references
- Facet data type validation
- Display order conflicts
- Navigation hierarchy integrity

### Vendor Validation
- Product listing validates required facets
- Only leaf categories selectable
- Facet values match allowed values
- Data types respected in forms

### API Validation
- Return only active records
- Filter by RLS policies
- Enforce CORS headers
- Handle errors gracefully
- Return consistent format

---

## Monitoring & Maintenance

### Admin Responsibilities
- Review category structure quarterly
- Update facets as product lines evolve
- Monitor featured category performance
- Audit navigation visibility settings
- Clean up inactive categories/facets

### System Health Checks
- API response times (< 500ms target)
- Database query performance
- RLS policy efficiency
- Cache hit rates (storefront)
- Error rates by endpoint

### Vendor Support
- Provide catalog rules documentation
- Answer taxonomy questions
- Guide on required facets
- Clarify leaf category concept
- Support product listing validation

---

## Documentation Hierarchy

### For Administrators
1. `CATALOG_GOVERNANCE_AUTHORITY.md` ← THIS FILE (start here)
2. `CATEGORY_SYSTEM_GUIDE.md` - Category management
3. `FACET_FILTER_SYSTEM.md` - Facet system details
4. `HYBRID_CATEGORY_SYSTEM.md` - Hybrid approach overview

### For Vendors
1. `CATALOG_RULES_VENDOR.md` - Vendor catalog rules guide
2. `CATALOG_RULES_QUICK_GUIDE.md` - Quick reference

### For Developers (External)
1. `API_ENDPOINTS_REFERENCE.md` - Quick API reference
2. `CATALOG_API_QUICK_START.md` - 5-minute integration
3. `CATALOG_API_DOCUMENTATION.md` - Complete API docs

### System Overview
1. `CATALOG_SYSTEM_COMPLETE.md` - Full implementation summary

---

## Security Model

### Admin Access
- Role: `admin` in `admin_users` table
- RLS: `is_admin()` function returns true
- Permissions: Full CRUD on all catalog tables
- Audit: All changes logged

### Vendor Access
- Role: `vendor` in `vendors` table
- RLS: `is_vendor()` function returns true
- Permissions: SELECT only on catalog tables
- Restrictions: No INSERT/UPDATE/DELETE

### Public API Access
- Role: Anonymous/Public
- RLS: Filters by `is_active = true`
- Permissions: SELECT on visible records only
- CORS: Enabled for all origins

---

## Deployment Status

### ✅ Implemented Components

**Admin Dashboard**:
- [x] Category management (CRUD)
- [x] Facet management (CRUD)
- [x] Facet value management (CRUD)
- [x] Facet group management (CRUD)
- [x] Category-facet assignments (CRUD)
- [x] Navigation settings (visibility control)

**Vendor Dashboard**:
- [x] Catalog Rules component (read-only)
- [x] Category browser tab
- [x] Facets preview tab
- [x] Navigation info tab
- [x] Sidebar menu integration
- [x] Zero edit functionality

**Public APIs**:
- [x] GET /get-catalog-navigation (deployed)
- [x] GET /get-catalog-taxonomy (deployed)
- [x] GET /get-catalog-facets (deployed)
- [x] CORS headers configured
- [x] Error handling implemented
- [x] Response format standardized

**Database**:
- [x] All catalog tables created
- [x] RLS policies applied
- [x] Indexes optimized
- [x] Foreign key constraints
- [x] Audit triggers (optional)

**Documentation**:
- [x] Authority document (this file)
- [x] Admin guides
- [x] Vendor guides
- [x] API documentation
- [x] Integration examples

---

## Summary - The Iron Rules

1. **Single Source of Truth**: This project, nowhere else
2. **Admin Authority**: Full control over catalog governance
3. **Vendor Restriction**: Read-only access via Catalog Rules
4. **Public APIs**: Expose data to external consumers
5. **No Duplication**: Never recreate catalog elsewhere
6. **One-Way Flow**: Admin → Database → Consumers
7. **Leaf Categories**: Only leaf nodes assignable to products
8. **Required Facets**: Enforced per category
9. **Navigation Control**: Admin decides visibility
10. **Real-Time Propagation**: Changes visible immediately

---

## Final Authority Statement

> This Admin + Vendor Dashboard project is the **AUTHORITATIVE** and **EXCLUSIVE** system for catalog governance. No other project, database, codebase, or system should attempt to define, manage, or duplicate category hierarchies, facet definitions, or navigation structures. All external consumers must integrate via the provided public APIs. This architecture is non-negotiable and must be preserved.

**Status**: ✅ Fully Implemented and Enforced
**Authority**: Absolute
**Scope**: All catalog governance
**Exceptions**: None

---

**Last Updated**: February 3, 2026
**Version**: 1.0.0 (Authoritative)
