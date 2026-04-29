# External Dashboard Integration Instructions

## Overview

This storefront is now fully configured to consume catalog data from the external Admin Dashboard at `https://vendor.sufisciencecenter.info`.

The storefront will attempt to fetch catalog data from the external dashboard and gracefully fall back to local Supabase if the external API is unavailable.

---

## Required Actions on External Dashboard

To complete the integration, the external Admin Dashboard (`https://vendor.sufisciencecenter.info`) must expose the following three public API endpoints:

### 1. Navigation Endpoint

**Endpoint**: `GET /api/catalog/navigation`

**Purpose**: Provides navigation structure for desktop and mobile menus

**Requirements**:
- Must be publicly accessible (no authentication required)
- Should return category hierarchy with subcategories
- Response format should match the navigation structure

**Example Response**:
```json
[
  {
    "id": "uuid",
    "name": "Prayer & Remembrance",
    "slug": "prayer-remembrance",
    "description": "For sacred focus and daily remembrance",
    "layer": 1,
    "sort_order": 1,
    "is_visible": true,
    "subcategories": [
      {
        "id": "uuid",
        "name": "Prayer Beads",
        "slug": "prayer-beads",
        "layer": 2,
        "parent_id": "uuid",
        "sort_order": 1,
        "is_visible": true
      }
    ]
  }
]
```

---

### 2. Taxonomy Endpoint

**Endpoint**: `GET /api/catalog/taxonomy`

**Optional Query Parameter**: `?category={slug}`

**Purpose**: Provides category hierarchy and details for category pages

**Requirements**:
- Must be publicly accessible (no authentication required)
- When `category` param provided, returns single category with subcategories
- When no param provided, returns entire taxonomy tree
- Response should include category metadata (name, description, etc.)

**Example Response (with category param)**:
```json
{
  "id": "uuid",
  "name": "Prayer & Remembrance",
  "slug": "prayer-remembrance",
  "description": "For sacred focus and daily remembrance across traditions",
  "layer": 1,
  "sort_order": 1,
  "is_visible": true,
  "subcategories": [
    {
      "id": "uuid",
      "name": "Prayer Beads",
      "slug": "prayer-beads",
      "layer": 2,
      "parent_id": "uuid",
      "sort_order": 1,
      "is_visible": true
    }
  ]
}
```

---

### 3. Facets Endpoint

**Endpoint**: `GET /api/catalog/facets`

**Required Query Parameter**: `?category={slug}`

**Purpose**: Provides dynamic filter options for category pages

**Requirements**:
- Must be publicly accessible (no authentication required)
- Must require `category` query parameter
- Returns facet configuration for filters (price, materials, traditions, etc.)
- Should include counts for each option

**Example Response**:
```json
[
  {
    "id": "price",
    "name": "Price Range",
    "type": "range",
    "min": 10,
    "max": 500
  },
  {
    "id": "materials",
    "name": "Materials",
    "type": "multiselect",
    "options": [
      {
        "value": "Wood",
        "label": "Wood",
        "count": 25
      },
      {
        "value": "Metal",
        "label": "Metal",
        "count": 15
      }
    ]
  },
  {
    "id": "traditions",
    "name": "Faith Tradition",
    "type": "multiselect",
    "options": [
      {
        "value": "Islamic",
        "label": "Islamic",
        "count": 42
      },
      {
        "value": "Christian",
        "label": "Christian",
        "count": 38
      }
    ]
  }
]
```

---

## CORS Configuration

The external dashboard must enable CORS for the storefront domain to allow browser-based fetch requests.

**Add these CORS headers to all three endpoints**:
```
Access-Control-Allow-Origin: *
  (or specific storefront domain for better security)
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## How the Integration Works

### Storefront Configuration

The storefront has been configured with:
```bash
NEXT_PUBLIC_CATALOG_API_BASE_URL=https://vendor.sufisciencecenter.info
```

### Request Flow

1. When a user accesses the storefront, the navigation component makes a request to:
   ```
   /api/catalog/navigation
   ```

2. The storefront's API route attempts to fetch from:
   ```
   https://vendor.sufisciencecenter.info/api/catalog/navigation
   ```

3. If successful, the external data is used. If the request fails or times out, the storefront falls back to local Supabase data.

4. The same pattern applies to taxonomy and facets endpoints.

---

## Testing the Integration

### 1. Test External Endpoints

From the external dashboard, verify these URLs are accessible:

```bash
# Test navigation
curl https://vendor.sufisciencecenter.info/api/catalog/navigation

# Test taxonomy (all categories)
curl https://vendor.sufisciencecenter.info/api/catalog/taxonomy

# Test taxonomy (specific category)
curl https://vendor.sufisciencecenter.info/api/catalog/taxonomy?category=prayer-remembrance

# Test facets
curl https://vendor.sufisciencecenter.info/api/catalog/facets?category=prayer-remembrance
```

### 2. Test CORS

From a browser console on the storefront:
```javascript
fetch('https://vendor.sufisciencecenter.info/api/catalog/navigation')
  .then(res => res.json())
  .then(data => console.log('Navigation:', data))
  .catch(err => console.error('Error:', err));
```

### 3. Monitor Fallback Behavior

If the external API is unavailable, check the storefront's server logs. You should see:
```
"Failed to fetch from external catalog API, using local fallback"
```

---

## Benefits of This Architecture

1. **Single Source of Truth**: Admin Dashboard controls all catalog structure
2. **High Availability**: Graceful fallback ensures storefront remains functional
3. **Real-time Updates**: Catalog changes in dashboard immediately reflect on storefront
4. **Scalability**: Multiple storefronts can consume same catalog
5. **Maintainability**: Catalog changes happen in one location

---

## Current Status

### ✅ Storefront Side (Complete)
- Environment variable configured
- All three API proxy endpoints implemented
- Fallback logic in place
- Components consuming dynamic data
- Build successful

### ⚠️ External Dashboard Side (Required)
- Must expose three public catalog endpoints
- Must enable CORS for storefront domain
- Must ensure response format matches contract

---

## Support

For questions about the storefront implementation, see:
- `STOREFRONT_READ_ONLY_ARCHITECTURE.md` - Architecture details
- `CATALOG_INTEGRATION_COMPLETE.md` - Implementation summary

For questions about the external dashboard implementation, contact the Admin Dashboard team.
