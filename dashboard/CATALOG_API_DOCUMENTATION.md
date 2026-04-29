# Catalog API Documentation

## Overview

Three read-only Supabase Edge Functions that expose the Admin Dashboard's catalog governance system to external consumers (storefronts, mobile apps, etc.).

**Source of Truth**: Admin Dashboard → Catalog Governance modules
**Data Flow**: One-way (Admin controls, APIs expose)
**Security**: Public read-only access, no authentication required for public storefronts

---

## Base URL

```
https://[your-project-id].supabase.co/functions/v1/
```

---

## API Endpoints

### 1. GET /get-catalog-navigation

Returns storefront menu structure controlled by Admin.

#### Endpoint
```
GET /get-catalog-navigation
```

#### Description
Provides the hierarchical navigation menu structure for storefronts, including:
- Active categories marked for navigation display
- Featured categories for homepage sections
- Static navigation links (e.g., About, Contact)
- Proper hierarchy with parent-child relationships

#### Query Parameters
None

#### Response Format
```json
{
  "success": true,
  "data": {
    "navigation": [
      {
        "id": "category-uuid",
        "name": "Fashion",
        "slug": "fashion",
        "icon": "👔",
        "level": 0,
        "display_order": 1,
        "is_featured": true,
        "show_in_navigation": true,
        "parent_id": null,
        "children": [
          {
            "id": "child-uuid",
            "name": "Modest Clothing",
            "slug": "modest-clothing",
            "icon": "🧕",
            "level": 1,
            "display_order": 1,
            "is_featured": false,
            "show_in_navigation": true,
            "parent_id": "category-uuid"
          }
        ]
      }
    ],
    "featured": [
      {
        "id": "category-uuid",
        "name": "Fashion",
        "slug": "fashion",
        "icon": "👔",
        "description": "Modest and elegant clothing"
      }
    ],
    "static_links": [
      {
        "id": "link-uuid",
        "label": "About Us",
        "url": "/about",
        "display_order": 1,
        "is_active": true
      }
    ]
  },
  "meta": {
    "total_categories": 15,
    "featured_count": 3,
    "static_links_count": 5,
    "generated_at": "2026-02-03T12:00:00.000Z"
  }
}
```

#### Usage Example
```javascript
// Fetch navigation for storefront header
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/get-catalog-navigation'
);
const { data } = await response.json();

// Render main navigation
data.navigation.forEach(category => {
  renderNavItem(category);
});

// Render featured section on homepage
data.featured.forEach(category => {
  renderFeaturedCard(category);
});
```

#### Use Cases
- Render main navigation menu in storefront header
- Display category dropdowns/megamenus
- Show featured categories on homepage
- Generate breadcrumb navigation
- Populate footer category links

---

### 2. GET /get-catalog-taxonomy

Returns full hierarchical category tree. Only leaf categories are selectable for products.

#### Endpoint
```
GET /get-catalog-taxonomy
```

#### Description
Provides complete category taxonomy with:
- Full parent-child hierarchy
- Leaf category identification (assignable to products)
- Category metadata (icons, descriptions, slugs)
- Flexible output formats (tree or flat)

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_inactive` | boolean | false | Include inactive categories |
| `flat` | boolean | false | Return flat list instead of tree |
| `category_id` | uuid | null | Filter to specific category |

#### Response Format (Tree Structure)
```json
{
  "success": true,
  "data": {
    "tree": [
      {
        "id": "parent-uuid",
        "parent_id": null,
        "name": "Home Decor",
        "slug": "home-decor",
        "description": "Elegant Islamic home decorations",
        "icon": "🏠",
        "level": 0,
        "display_order": 1,
        "is_active": true,
        "show_in_navigation": true,
        "is_featured": true,
        "is_leaf": false,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "children": [
          {
            "id": "child-uuid",
            "parent_id": "parent-uuid",
            "name": "Wall Art",
            "slug": "wall-art",
            "description": "Islamic calligraphy and art",
            "icon": "🖼️",
            "level": 1,
            "display_order": 1,
            "is_active": true,
            "show_in_navigation": true,
            "is_featured": false,
            "is_leaf": true,
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z"
          }
        ]
      }
    ],
    "leaf_categories": [
      {
        "id": "child-uuid",
        "name": "Wall Art",
        "slug": "wall-art",
        "is_leaf": true,
        // ... full category object
      }
    ],
    "all_categories": [
      // Flat list of all categories
    ]
  },
  "meta": {
    "total_categories": 45,
    "leaf_categories": 28,
    "root_categories": 5,
    "max_depth": 3,
    "generated_at": "2026-02-03T12:00:00.000Z"
  }
}
```

#### Response Format (Flat Structure)
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "parent_id": null,
        "name": "Fashion",
        "slug": "fashion",
        "level": 0,
        "is_leaf": false,
        // ... other fields
      },
      {
        "id": "uuid",
        "parent_id": "parent-uuid",
        "name": "Modest Clothing",
        "slug": "modest-clothing",
        "level": 1,
        "is_leaf": true,
        // ... other fields
      }
    ]
  },
  "meta": {
    "total_categories": 45,
    "leaf_categories": 28,
    "max_depth": 3,
    "generated_at": "2026-02-03T12:00:00.000Z"
  }
}
```

#### Usage Examples

**Example 1: Build Category Browser**
```javascript
// Fetch full taxonomy tree
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/get-catalog-taxonomy'
);
const { data } = await response.json();

// Render hierarchical category browser
function renderCategoryTree(categories, level = 0) {
  return categories.map(cat => `
    <div style="margin-left: ${level * 20}px">
      <span>${cat.icon} ${cat.name}</span>
      ${cat.is_leaf ? '✓ (selectable)' : ''}
      ${cat.children ? renderCategoryTree(cat.children, level + 1) : ''}
    </div>
  `).join('');
}

document.getElementById('category-tree').innerHTML =
  renderCategoryTree(data.tree);
```

**Example 2: Product Category Selector**
```javascript
// Fetch only leaf categories (assignable to products)
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/get-catalog-taxonomy'
);
const { data } = await response.json();

// Populate category dropdown with only selectable options
const select = document.getElementById('product-category');
data.leaf_categories.forEach(cat => {
  const option = document.createElement('option');
  option.value = cat.id;
  option.text = `${cat.icon} ${cat.name}`;
  select.appendChild(option);
});
```

**Example 3: Flat List for Search Index**
```javascript
// Fetch flat structure for search indexing
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/get-catalog-taxonomy?flat=true'
);
const { data } = await response.json();

// Index all categories for search
data.categories.forEach(cat => {
  searchIndex.add({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    keywords: cat.description,
  });
});
```

#### Use Cases
- Render category browsing UI
- Product category selection dropdowns
- Breadcrumb generation
- SEO sitemap generation
- Search index building
- Category landing pages
- Filter sidebars

---

### 3. GET /get-catalog-facets

Returns facet groups, facet values, and category-to-facet mappings (required vs optional).

#### Endpoint
```
GET /get-catalog-facets
```

#### Description
Provides complete facet system including:
- Facet groups (e.g., "Physical Attributes", "Material Properties")
- Individual facets with data types and values
- Category-specific facet requirements
- Required vs optional facet mappings

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category_id` | uuid | null | Get facets for specific category |
| `facet_group_id` | uuid | null | Filter to specific facet group |
| `include_inactive` | boolean | false | Include inactive facets |

#### Response Format (All Facets)
```json
{
  "success": true,
  "data": {
    "facet_groups": [
      {
        "id": "group-uuid",
        "name": "Physical Attributes",
        "slug": "physical-attributes",
        "description": "Size, weight, dimensions",
        "display_order": 1,
        "is_active": true,
        "facets": [
          {
            "id": "facet-uuid",
            "facet_group_id": "group-uuid",
            "name": "Size",
            "slug": "size",
            "description": "Clothing size",
            "data_type": "select",
            "is_required": false,
            "display_order": 1,
            "is_active": true,
            "values": [
              {
                "id": "value-uuid",
                "facet_id": "facet-uuid",
                "value": "Small",
                "display_order": 1,
                "is_active": true
              },
              {
                "id": "value-uuid",
                "facet_id": "facet-uuid",
                "value": "Medium",
                "display_order": 2,
                "is_active": true
              }
            ]
          }
        ]
      }
    ],
    "ungrouped_facets": [
      // Facets not assigned to any group
    ],
    "all_facets": [
      // Flat list of all facets
    ],
    "category_mappings": [
      {
        "category_id": "cat-uuid",
        "category_name": "Modest Clothing",
        "category_slug": "modest-clothing",
        "facet_id": "facet-uuid",
        "facet_name": "Size",
        "is_required": true,
        "display_order": 1
      }
    ]
  },
  "meta": {
    "total_groups": 5,
    "total_facets": 23,
    "total_values": 147,
    "total_mappings": 89,
    "generated_at": "2026-02-03T12:00:00.000Z"
  }
}
```

#### Response Format (Category-Specific)
```json
{
  "success": true,
  "data": {
    "facet_groups": [...],
    "category_mappings": [...],
    "category_details": {
      "category_id": "cat-uuid",
      "required": [
        {
          "category_id": "cat-uuid",
          "category_name": "Modest Clothing",
          "facet_id": "facet-uuid",
          "facet_name": "Size",
          "is_required": true,
          "display_order": 1,
          "facet": {
            "id": "facet-uuid",
            "name": "Size",
            "slug": "size",
            "data_type": "select",
            "values": [
              {"value": "XS"},
              {"value": "S"},
              {"value": "M"}
            ]
          }
        }
      ],
      "optional": [
        // Optional facets for this category
      ],
      "total": 8
    }
  },
  "meta": {
    "total_groups": 5,
    "total_facets": 23,
    "total_values": 147,
    "total_mappings": 89,
    "generated_at": "2026-02-03T12:00:00.000Z"
  }
}
```

#### Usage Examples

**Example 1: Product Filter Sidebar**
```javascript
// Fetch facets for current category
const categoryId = 'modest-clothing-uuid';
const response = await fetch(
  `https://your-project.supabase.co/functions/v1/get-catalog-facets?category_id=${categoryId}`
);
const { data } = await response.json();

// Render filter controls
data.category_details.required.forEach(mapping => {
  const facet = mapping.facet;
  renderFilterControl(facet.name, facet.data_type, facet.values);
});

data.category_details.optional.forEach(mapping => {
  const facet = mapping.facet;
  renderFilterControl(facet.name, facet.data_type, facet.values);
});
```

**Example 2: Product Form Validation**
```javascript
// Get required facets for selected category
const response = await fetch(
  `https://your-project.supabase.co/functions/v1/get-catalog-facets?category_id=${categoryId}`
);
const { data } = await response.json();

// Validate product submission
const requiredFacets = data.category_details.required;
const missingFacets = requiredFacets.filter(facet =>
  !productData[facet.facet.slug]
);

if (missingFacets.length > 0) {
  alert(`Missing required attributes: ${missingFacets.map(f => f.facet_name).join(', ')}`);
  return false;
}
```

**Example 3: Dynamic Filter URL Generation**
```javascript
// Build filter URLs based on facet values
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/get-catalog-facets'
);
const { data } = await response.json();

// Create filter links
data.all_facets.forEach(facet => {
  facet.values.forEach(value => {
    const filterUrl = `/products?${facet.slug}=${value.value}`;
    renderFilterLink(facet.name, value.value, filterUrl);
  });
});
```

#### Use Cases
- Render product filter sidebars
- Product form field generation
- Validation of product attributes
- Search faceted navigation
- Advanced filtering UI
- Product comparison features
- Dynamic form builders

---

## Data Types

### Facet Data Types

| Type | Description | UI Control |
|------|-------------|------------|
| `text` | Free-form text input | `<input type="text">` |
| `number` | Numeric value | `<input type="number">` |
| `boolean` | True/false | `<input type="checkbox">` |
| `select` | Single choice from predefined values | `<select>` dropdown |
| `multi_select` | Multiple choices from predefined values | Checkboxes or multi-select |

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Database or server error

---

## CORS

All endpoints include CORS headers for cross-origin access:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Client-Info, Apikey
```

---

## Authentication

**Public Access**: These APIs are designed for public storefront consumption and do not require authentication.

**Row Level Security**: Database RLS policies ensure only active, approved data is accessible.

**No Write Access**: All endpoints are read-only (GET only).

---

## Rate Limiting

Supabase Edge Functions have default rate limits:
- Development: Generous limits for testing
- Production: Contact Supabase for custom limits

**Best Practices:**
- Cache API responses on client side
- Use appropriate cache headers
- Implement client-side caching (localStorage, Redis)
- Don't fetch on every page render

---

## Caching Strategy

**Recommended Implementation:**

```javascript
// Cache for 1 hour
const CACHE_TTL = 3600000; // 1 hour in milliseconds
const CACHE_KEY = 'catalog_navigation';

async function getCatalogNavigation() {
  // Check cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }

  // Fetch fresh data
  const response = await fetch(
    'https://your-project.supabase.co/functions/v1/get-catalog-navigation'
  );
  const result = await response.json();

  // Cache the response
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: result,
    timestamp: Date.now(),
  }));

  return result;
}
```

---

## Integration Examples

### React/Next.js

```typescript
// hooks/useCatalogNavigation.ts
import { useState, useEffect } from 'react';

interface NavigationData {
  navigation: Category[];
  featured: Category[];
  static_links: StaticLink[];
}

export function useCatalogNavigation() {
  const [data, setData] = useState<NavigationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('https://your-project.supabase.co/functions/v1/get-catalog-navigation')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
        } else {
          setError(new Error(result.error));
        }
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// Usage in component
function Header() {
  const { data, loading, error } = useCatalogNavigation();

  if (loading) return <div>Loading navigation...</div>;
  if (error) return <div>Error loading navigation</div>;

  return (
    <nav>
      {data?.navigation.map(category => (
        <NavItem key={category.id} category={category} />
      ))}
    </nav>
  );
}
```

### Vue.js

```javascript
// composables/useCatalogTaxonomy.js
import { ref, onMounted } from 'vue';

export function useCatalogTaxonomy(categoryId = null) {
  const data = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchTaxonomy = async () => {
    try {
      const url = categoryId
        ? `https://your-project.supabase.co/functions/v1/get-catalog-taxonomy?category_id=${categoryId}`
        : 'https://your-project.supabase.co/functions/v1/get-catalog-taxonomy';

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        data.value = result.data;
      } else {
        error.value = result.error;
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchTaxonomy);

  return { data, loading, error, refetch: fetchTaxonomy };
}
```

### Plain JavaScript

```javascript
// catalog-api.js
class CatalogAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  async getNavigation() {
    const cached = this.cache.get('navigation');
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached.data;
    }

    const response = await fetch(`${this.baseUrl}/get-catalog-navigation`);
    const result = await response.json();

    if (result.success) {
      this.cache.set('navigation', {
        data: result.data,
        timestamp: Date.now(),
      });
      return result.data;
    }

    throw new Error(result.error);
  }

  async getTaxonomy(options = {}) {
    const params = new URLSearchParams(options);
    const response = await fetch(
      `${this.baseUrl}/get-catalog-taxonomy?${params}`
    );
    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    throw new Error(result.error);
  }

  async getFacets(categoryId = null) {
    const params = categoryId ? `?category_id=${categoryId}` : '';
    const response = await fetch(
      `${this.baseUrl}/get-catalog-facets${params}`
    );
    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    throw new Error(result.error);
  }
}

// Usage
const catalogAPI = new CatalogAPI(
  'https://your-project.supabase.co/functions/v1'
);

const navigation = await catalogAPI.getNavigation();
const taxonomy = await catalogAPI.getTaxonomy({ flat: true });
const facets = await catalogAPI.getFacets('category-uuid');
```

---

## Monitoring & Analytics

**Recommended Metrics to Track:**
- API response times
- Cache hit rates
- Most requested categories
- Most used facet filters
- Error rates by endpoint

**Supabase Dashboard:**
- View function invocation counts
- Monitor function execution times
- Check error logs
- Review usage patterns

---

## Maintenance & Updates

### When Admin Updates Catalog:

1. Admin modifies categories/facets in Admin Dashboard
2. Changes saved to database immediately
3. Next API call returns updated data
4. No cache invalidation needed (TTL handles freshness)

### Backward Compatibility:

- API response structure is stable
- New fields may be added (non-breaking)
- Deprecated fields will be maintained for 6 months
- Breaking changes will be versioned (v2 endpoints)

---

## Support & Resources

**Database Tables:**
- `categories` - Category hierarchy and metadata
- `facets` - Facet definitions and types
- `facet_values` - Allowed values for facets
- `facet_groups` - Facet organization
- `category_facets` - Category-to-facet mappings
- `navigation_links` - Static navigation links

**Related Documentation:**
- [Catalog Governance (Admin)](./CATALOG_RULES_VENDOR.md)
- [Category System Guide](./CATEGORY_SYSTEM_GUIDE.md)
- [Facet Filter System](./FACET_FILTER_SYSTEM.md)

---

## Summary

✅ **Three Production-Ready APIs:**
- GET /get-catalog-navigation - Menu structure
- GET /get-catalog-taxonomy - Category hierarchy
- GET /get-catalog-facets - Filters and attributes

✅ **Features:**
- Read-only access (no authentication required)
- CORS enabled for cross-origin requests
- Comprehensive query parameters
- Consistent JSON response format
- Detailed error handling

✅ **Single Source of Truth:**
- Admin Dashboard controls all catalog data
- APIs expose data in real-time
- No duplication or sync issues
- Immediate updates on admin changes

**Status**: ✅ Deployed and Ready for Integration
**Last Updated**: February 3, 2026
**Version**: 1.0.0
