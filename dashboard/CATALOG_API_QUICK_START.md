# Catalog API Quick Start Guide

## 🚀 Get Started in 5 Minutes

Three simple APIs to power your storefront catalog.

---

## Base URL

```
https://[your-supabase-project].supabase.co/functions/v1/
```

Replace `[your-supabase-project]` with your actual Supabase project ID.

---

## 1️⃣ Navigation API

**Purpose**: Get menu structure for your storefront header/footer

### Quick Example
```javascript
fetch('https://your-project.supabase.co/functions/v1/get-catalog-navigation')
  .then(res => res.json())
  .then(({ data }) => {
    // data.navigation = hierarchical menu tree
    // data.featured = featured categories
    // data.static_links = custom links (About, Contact, etc.)
  });
```

### Response
```json
{
  "data": {
    "navigation": [
      {
        "id": "uuid",
        "name": "Fashion",
        "slug": "fashion",
        "icon": "👔",
        "children": [...]
      }
    ],
    "featured": [...],
    "static_links": [...]
  }
}
```

### Use For
- Main navigation menu
- Footer category links
- Featured homepage sections

---

## 2️⃣ Taxonomy API

**Purpose**: Get full category tree (for browsing, filtering, dropdowns)

### Quick Example
```javascript
// Get hierarchical tree
fetch('https://your-project.supabase.co/functions/v1/get-catalog-taxonomy')
  .then(res => res.json())
  .then(({ data }) => {
    // data.tree = nested category tree
    // data.leaf_categories = categories that can have products
    // data.all_categories = flat list
  });

// Get flat list for dropdowns
fetch('https://your-project.supabase.co/functions/v1/get-catalog-taxonomy?flat=true')
  .then(res => res.json())
  .then(({ data }) => {
    // data.categories = simple array
  });
```

### Response
```json
{
  "data": {
    "tree": [
      {
        "id": "uuid",
        "name": "Home Decor",
        "slug": "home-decor",
        "is_leaf": false,
        "children": [
          {
            "id": "uuid",
            "name": "Wall Art",
            "slug": "wall-art",
            "is_leaf": true
          }
        ]
      }
    ],
    "leaf_categories": [...]
  }
}
```

### Query Parameters
- `?flat=true` - Get flat list instead of tree
- `?include_inactive=true` - Include inactive categories
- `?category_id=uuid` - Get specific category only

### Use For
- Category browsing pages
- Product category selectors
- Breadcrumb navigation
- SEO sitemaps

---

## 3️⃣ Facets API

**Purpose**: Get filters/attributes for product filtering and forms

### Quick Example
```javascript
// Get all facets
fetch('https://your-project.supabase.co/functions/v1/get-catalog-facets')
  .then(res => res.json())
  .then(({ data }) => {
    // data.facet_groups = organized facets
    // data.all_facets = all available facets
    // data.category_mappings = which categories use which facets
  });

// Get facets for specific category
const categoryId = 'your-category-uuid';
fetch(`https://your-project.supabase.co/functions/v1/get-catalog-facets?category_id=${categoryId}`)
  .then(res => res.json())
  .then(({ data }) => {
    // data.category_details.required = required facets
    // data.category_details.optional = optional facets
  });
```

### Response
```json
{
  "data": {
    "facet_groups": [
      {
        "name": "Physical Attributes",
        "facets": [
          {
            "name": "Size",
            "slug": "size",
            "data_type": "select",
            "values": [
              {"value": "Small"},
              {"value": "Medium"},
              {"value": "Large"}
            ]
          }
        ]
      }
    ],
    "category_details": {
      "required": [...],
      "optional": [...]
    }
  }
}
```

### Query Parameters
- `?category_id=uuid` - Get facets for specific category
- `?facet_group_id=uuid` - Get specific facet group
- `?include_inactive=true` - Include inactive facets

### Use For
- Product filter sidebars
- Product form validation
- Advanced search filters
- Product comparison

---

## 📝 Common Patterns

### Pattern 1: Build Main Navigation
```javascript
async function buildNavigation() {
  const res = await fetch('https://your-project.supabase.co/functions/v1/get-catalog-navigation');
  const { data } = await res.json();

  const nav = document.getElementById('main-nav');
  data.navigation.forEach(category => {
    const item = document.createElement('a');
    item.href = `/category/${category.slug}`;
    item.textContent = `${category.icon} ${category.name}`;
    nav.appendChild(item);
  });
}
```

### Pattern 2: Category Dropdown for Product Form
```javascript
async function populateCategoryDropdown() {
  const res = await fetch('https://your-project.supabase.co/functions/v1/get-catalog-taxonomy');
  const { data } = await res.json();

  const select = document.getElementById('product-category');
  // Only show leaf categories (can have products)
  data.leaf_categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = `${cat.icon} ${cat.name}`;
    select.appendChild(option);
  });
}
```

### Pattern 3: Product Filters Sidebar
```javascript
async function buildFilterSidebar(categoryId) {
  const res = await fetch(
    `https://your-project.supabase.co/functions/v1/get-catalog-facets?category_id=${categoryId}`
  );
  const { data } = await res.json();

  const sidebar = document.getElementById('filters');

  // Render facet groups
  data.facet_groups.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.innerHTML = `<h3>${group.name}</h3>`;

    group.facets.forEach(facet => {
      const filterEl = createFilterControl(facet);
      groupEl.appendChild(filterEl);
    });

    sidebar.appendChild(groupEl);
  });
}

function createFilterControl(facet) {
  if (facet.data_type === 'select') {
    // Create dropdown
    const select = document.createElement('select');
    select.name = facet.slug;
    facet.values.forEach(val => {
      const option = document.createElement('option');
      option.value = val.value;
      option.textContent = val.value;
      select.appendChild(option);
    });
    return select;
  }
  // Handle other data types...
}
```

### Pattern 4: Simple Caching
```javascript
class CatalogCache {
  constructor(ttl = 3600000) { // 1 hour default
    this.cache = new Map();
    this.ttl = ttl;
  }

  async fetch(url) {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    const response = await fetch(url);
    const data = await response.json();

    this.cache.set(url, {
      data,
      timestamp: Date.now()
    });

    return data;
  }
}

// Usage
const cache = new CatalogCache();
const data = await cache.fetch('https://your-project.supabase.co/functions/v1/get-catalog-navigation');
```

---

## 🎯 Use Case Examples

### E-commerce Storefront

```javascript
// 1. Load navigation on page load
const { data: nav } = await fetch('/functions/v1/get-catalog-navigation')
  .then(r => r.json());
renderHeader(nav.navigation);
renderFeaturedCategories(nav.featured);

// 2. Category landing page
const categorySlug = 'fashion';
const { data: taxonomy } = await fetch('/functions/v1/get-catalog-taxonomy')
  .then(r => r.json());
const category = taxonomy.all_categories.find(c => c.slug === categorySlug);
renderCategoryPage(category);

// 3. Product listing with filters
const { data: facets } = await fetch(
  `/functions/v1/get-catalog-facets?category_id=${category.id}`
).then(r => r.json());
renderFilterSidebar(facets.category_details);
```

### Mobile App

```dart
// Flutter example
class CatalogService {
  final String baseUrl;

  CatalogService(this.baseUrl);

  Future<NavigationData> getNavigation() async {
    final response = await http.get(
      Uri.parse('$baseUrl/get-catalog-navigation')
    );
    return NavigationData.fromJson(jsonDecode(response.body)['data']);
  }

  Future<TaxonomyData> getTaxonomy({bool flat = false}) async {
    final uri = Uri.parse('$baseUrl/get-catalog-taxonomy')
      .replace(queryParameters: {'flat': flat.toString()});
    final response = await http.get(uri);
    return TaxonomyData.fromJson(jsonDecode(response.body)['data']);
  }
}
```

### Admin Dashboard

```javascript
// Show vendor which categories are available
async function showAvailableCategories() {
  const { data } = await fetch('/functions/v1/get-catalog-taxonomy')
    .then(r => r.json());

  // Show only leaf categories (can have products)
  const selectableCategories = data.leaf_categories;
  renderCategoryPicker(selectableCategories);
}

// Show required fields when vendor selects category
async function onCategorySelected(categoryId) {
  const { data } = await fetch(
    `/functions/v1/get-catalog-facets?category_id=${categoryId}`
  ).then(r => r.json());

  const requiredFields = data.category_details.required;
  renderDynamicForm(requiredFields);
}
```

---

## ⚡ Performance Tips

### 1. Cache Responses
```javascript
// Client-side caching with localStorage
function getCachedOrFetch(url, cacheKey, ttl = 3600000) {
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < ttl) {
      return Promise.resolve(data);
    }
  }

  return fetch(url)
    .then(r => r.json())
    .then(result => {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));
      return result;
    });
}
```

### 2. Lazy Load Facets
```javascript
// Only fetch facets when user opens filter panel
document.getElementById('filter-toggle').addEventListener('click', async () => {
  if (!facetsLoaded) {
    const facets = await fetch('/functions/v1/get-catalog-facets')
      .then(r => r.json());
    renderFilters(facets.data);
    facetsLoaded = true;
  }
});
```

### 3. Use Flat Structure for Simple Lists
```javascript
// Faster for dropdowns - no tree processing needed
const { data } = await fetch('/functions/v1/get-catalog-taxonomy?flat=true')
  .then(r => r.json());
data.categories.forEach(renderOption);
```

---

## 🔍 Query Parameter Cheat Sheet

### Navigation API
- No parameters (returns everything)

### Taxonomy API
| Parameter | Values | Example |
|-----------|--------|---------|
| `flat` | `true`/`false` | `?flat=true` |
| `include_inactive` | `true`/`false` | `?include_inactive=true` |
| `category_id` | UUID | `?category_id=abc-123` |

### Facets API
| Parameter | Values | Example |
|-----------|--------|---------|
| `category_id` | UUID | `?category_id=abc-123` |
| `facet_group_id` | UUID | `?facet_group_id=xyz-789` |
| `include_inactive` | `true`/`false` | `?include_inactive=true` |

---

## 🚨 Error Handling

All APIs return consistent error format:

```javascript
fetch('/functions/v1/get-catalog-navigation')
  .then(res => res.json())
  .then(result => {
    if (!result.success) {
      console.error('API Error:', result.error);
      // Show user-friendly message
      showError('Unable to load navigation. Please try again.');
      return;
    }

    // Success - use result.data
    renderNavigation(result.data);
  })
  .catch(err => {
    console.error('Network Error:', err);
    showError('Network error. Please check your connection.');
  });
```

---

## 📚 Response Field Reference

### Common Fields
- `id` - Unique identifier (UUID)
- `name` - Display name
- `slug` - URL-friendly identifier
- `description` - Optional description
- `display_order` - Sort order
- `is_active` - Active status

### Category Specific
- `parent_id` - Parent category ID (null for root)
- `level` - Depth level (0 = root)
- `icon` - Emoji or icon
- `is_leaf` - Can have products (true/false)
- `show_in_navigation` - Visible in menu (true/false)
- `is_featured` - Featured on homepage (true/false)

### Facet Specific
- `data_type` - `text`, `number`, `boolean`, `select`, `multi_select`
- `is_required` - Required field (true/false)
- `values` - Array of allowed values (for select types)
- `facet_group_id` - Parent group ID

---

## 🎓 Next Steps

1. **Test the APIs** - Use the examples above in your console
2. **Implement Caching** - Reduce API calls for better performance
3. **Build Your UI** - Use the data to power your storefront
4. **Read Full Docs** - See `CATALOG_API_DOCUMENTATION.md` for details

---

## 📞 Support

**Database Schema**:
- `categories` - Category hierarchy
- `facets` - Filter definitions
- `facet_values` - Allowed values
- `category_facets` - Category-facet mappings

**Related Guides**:
- Full API Documentation
- Category System Guide
- Facet Filter System
- Admin Catalog Governance

---

## ✅ Quick Checklist

- [ ] Get your Supabase project URL
- [ ] Test navigation API in browser/Postman
- [ ] Implement basic caching
- [ ] Build navigation menu
- [ ] Add category browsing
- [ ] Implement product filters
- [ ] Test on mobile devices
- [ ] Monitor API performance

**Status**: ✅ APIs Deployed and Ready
**Version**: 1.0.0
**Last Updated**: February 3, 2026
