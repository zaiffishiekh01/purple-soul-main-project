# Storefront - Read-Only Catalog Consumer Architecture

## Executive Summary

This storefront project is a **READ-ONLY CONSUMER** of catalog governance defined in the external Admin + Vendor Dashboard project (`https://vendor.sufisciencecenter.info`).

**Core Principle**: The storefront **renders what it receives and nothing more**.

---

## Architecture Requirements

### ✅ MUST DO

1. **Fetch catalog data ONLY via Admin-controlled APIs**
   - `/api/catalog/navigation` → Navigation menu structure
   - `/api/catalog/taxonomy` → Category hierarchy and structure
   - `/api/catalog/facets` → Dynamic filters per category

2. **Render strictly from API responses**
   - Navigation menus
   - Category pages
   - Search filters
   - Product browsing

3. **Maintain zero local catalog definitions**
   - No hardcoded category names
   - No hardcoded navigation structure
   - No hardcoded filter options
   - No hardcoded facet configurations

### ❌ MUST NOT DO

1. **Contain hardcoded categories, menus, or filter definitions**
2. **Contain admin or vendor catalog management UI**
3. **Allow catalog structure modification**
4. **Define its own catalog governance**

---

## Implementation Status

### ✅ Completed

#### 1. API Endpoints Created
- **`/api/catalog/navigation`** - Returns navigation structure for header/menu
- **`/api/catalog/taxonomy`** - Returns taxonomy structure for category pages
- **`/api/catalog/facets`** - Returns dynamic facets/filters per category

#### 2. Components Updated to Consume APIs
- **`components/layout/main-nav.tsx`** - Fetches from `/api/catalog/navigation`
- **`components/layout/mobile-nav.tsx`** - Fetches from `/api/catalog/navigation`
- **`components/search/search-filters.tsx`** - Fetches from `/api/catalog/facets`
- **`app/c/[category]/page.tsx`** - Fetches from `/api/catalog/taxonomy`

#### 3. Admin UI Made Read-Only
- **`app/admin/categories/page.tsx`** - Converted to read-only view
- Clear messaging that catalog is managed externally
- Direct link to external dashboard

#### 4. Admin API Routes Disabled
- **`app/api/admin/categories/route.ts`** - Returns 410 Gone
- **`app/api/admin/categories/[categoryId]/route.ts`** - Returns 410 Gone
- All POST, PUT, PATCH, DELETE operations disabled

#### 5. Hardcoded Data Removed
- ~~Removed `categoryNames` map from category pages~~
- ~~Removed `categoryDescriptions` map from category pages~~
- ~~Removed `TRADITIONS` array from search filters~~
- ~~Removed `MATERIALS` array from search filters~~

---

## Data Flow

```
External Admin Dashboard
         ↓
   (Catalog Governance)
         ↓
  Catalog API Endpoints
    (/api/catalog/*)
         ↓
   Storefront Components
         ↓
    User Interface
```

---

## Key Files

### API Endpoints (Source of Truth)
```
app/api/catalog/
├── navigation/route.ts    # Navigation structure
├── taxonomy/route.ts      # Category hierarchy
└── facets/route.ts        # Dynamic filters
```

### Consumer Components
```
components/layout/
├── main-nav.tsx           # Desktop navigation (API consumer)
└── mobile-nav.tsx         # Mobile navigation (API consumer)

components/search/
└── search-filters.tsx     # Dynamic filters (API consumer)

app/c/[category]/
└── page.tsx               # Category pages (API consumer)

app/admin/categories/
└── page.tsx               # Read-only admin view
```

### Client Library
```
lib/api/
└── external-catalog.ts    # External dashboard client with caching
```

---

## Current State

### What's Working
✅ Navigation dynamically loaded from API
✅ Category data fetched from taxonomy API
✅ Search filters dynamically populated from facets API
✅ Admin categories page is read-only
✅ All catalog modification endpoints disabled
✅ Build passes successfully

### Integration Path

**Status**: ✅ **COMPLETE - External Integration Active**

All catalog API endpoints now fetch from the external Admin Dashboard:

**Environment Variable**:
```bash
NEXT_PUBLIC_CATALOG_API_BASE_URL=https://vendor.sufisciencecenter.info
```

**How It Works**:
1. Each API endpoint (`/api/catalog/navigation`, `/api/catalog/taxonomy`, `/api/catalog/facets`) first attempts to fetch from the external dashboard
2. If the external API is unreachable or returns an error, it gracefully falls back to local Supabase data
3. This ensures the storefront remains functional even if the external dashboard is temporarily unavailable

**External Dashboard Requirements**:
The Admin Dashboard at `https://vendor.sufisciencecenter.info` must expose these three public (no auth) endpoints:
- `GET /api/catalog/navigation`
- `GET /api/catalog/taxonomy?category={slug}`
- `GET /api/catalog/facets?category={slug}`

**CORS**: The external dashboard must enable CORS for this storefront domain

---

## Remaining Work

### Category Page Filters
The category page (`app/c/[category]/page.tsx`) still contains hardcoded filter arrays inline:
- Faith Tradition filters (line ~284)
- Purpose filters (line ~315)
- Craft Origin filters (line ~346)
- Material filters (line ~370+)
- And others...

**Recommendation**: Refactor the entire filter sidebar to use the `/api/catalog/facets` endpoint dynamically, similar to how `search-filters.tsx` was updated.

---

## Benefits of This Architecture

### 1. Single Source of Truth
All catalog structure managed in one place (Admin Dashboard)

### 2. Consistency
Navigation and categories always match across all storefronts

### 3. Flexibility
- Easy to add new categories without code changes
- Easy to modify filters without deployments
- Multiple storefronts can consume same catalog

### 4. Maintainability
- Changes to catalog happen in one location
- No code changes needed for catalog updates
- Clear separation of concerns

### 5. Scalability
- Can support multiple brands/storefronts
- Can support multiple languages
- Can support A/B testing of catalog structure

---

## Testing the Read-Only Architecture

### Verify No Hardcoded Categories
```bash
# Should return no results
grep -r "categoryNames" app/
grep -r "const TRADITIONS" components/
grep -r "const MATERIALS" components/
```

### Verify API Consumption
1. Open browser DevTools → Network tab
2. Navigate to homepage
3. Verify API calls to `/api/catalog/navigation`
4. Navigate to category page
5. Verify API calls to `/api/catalog/taxonomy` and `/api/catalog/facets`

### Verify Admin Routes Disabled
```bash
curl -X POST http://localhost:3000/api/admin/categories
# Should return 410 Gone
```

---

## Environment Variables

```bash
# External dashboard URL (optional, defaults to local)
NEXT_PUBLIC_EXTERNAL_DASHBOARD_URL=https://vendor.sufisciencecenter.info
```

---

## Portal Integration

The "Portal" link in navigation points directly to external dashboard:
- **URL**: `https://vendor.sufisciencecenter.info`
- **Opens in**: New tab
- **Security**: `rel="noopener noreferrer"`
- **Location**: Desktop & mobile navigation

---

## Notes

- The `/portal` page still exists but is no longer linked in navigation
- Local Supabase database continues to store products, orders, users, etc.
- Only **catalog structure** (categories, navigation, facets) is externally governed
- All transactional data remains in local Supabase

---

## Support

For questions about catalog structure, contact the Admin Dashboard team.

For questions about storefront functionality, see the main README.md.
