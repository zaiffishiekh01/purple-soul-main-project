# API Endpoints Quick Reference

## Catalog APIs - Live Endpoints

All endpoints are deployed and ready for integration.

---

## Base URL

```
https://<your-dashboard-host>/
```

---

## 1. Navigation API

### Endpoint
```
GET /get-catalog-navigation
```

### Status
✅ **ACTIVE** - Public access (no JWT required)

### Purpose
Get storefront menu structure, featured categories, and static links

### Example Request
```bash
curl https://your-dashboard.example.com/api/catalog/navigation
```

### Example Response
```json
{
  "success": true,
  "data": {
    "navigation": [
      {
        "id": "uuid",
        "name": "Fashion",
        "slug": "fashion",
        "icon": "👔",
        "level": 0,
        "display_order": 1,
        "is_featured": true,
        "show_in_navigation": true,
        "parent_id": null,
        "children": [...]
      }
    ],
    "featured": [...],
    "static_links": [...]
  },
  "meta": {
    "total_categories": 15,
    "featured_count": 3,
    "static_links_count": 5,
    "generated_at": "2026-02-03T12:00:00.000Z"
  }
}
```

### JavaScript Example
```javascript
const response = await fetch(
  'https://your-dashboard.example.com/api/catalog/navigation'
);
const { data } = await response.json();
console.log(data.navigation); // Menu structure
console.log(data.featured);   // Featured categories
```

---

## 2. Taxonomy API

### Endpoint
```
GET /get-catalog-taxonomy
```

### Status
✅ **ACTIVE** - Public access (no JWT required)

### Purpose
Get full category hierarchy, leaf categories, and taxonomy tree

### Query Parameters
- `flat=true` - Return flat list instead of tree
- `include_inactive=true` - Include inactive categories
- `category_id=uuid` - Get specific category only

### Example Request
```bash
# Get hierarchical tree
curl https://your-dashboard.example.com/api/catalog/taxonomy

# Get flat list
curl https://your-dashboard.example.com/api/catalog/taxonomy?flat=true

# Get specific category
curl https://your-dashboard.example.com/api/catalog/taxonomy?category_id=abc-123
```

### Example Response
```json
{
  "success": true,
  "data": {
    "tree": [
      {
        "id": "uuid",
        "parent_id": null,
        "name": "Home Decor",
        "slug": "home-decor",
        "icon": "🏠",
        "level": 0,
        "is_leaf": false,
        "children": [...]
      }
    ],
    "leaf_categories": [...],
    "all_categories": [...]
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

### JavaScript Example
```javascript
// Get category tree
const response = await fetch(
  'https://your-dashboard.example.com/api/catalog/taxonomy'
);
const { data } = await response.json();

// Render category browser
data.tree.forEach(category => {
  renderCategoryTree(category);
});

// Get only selectable categories (leaf nodes)
const selectableCategories = data.leaf_categories;
```

---

## 3. Facets API

### Endpoint
```
GET /get-catalog-facets
```

### Status
✅ **ACTIVE** - Public access (no JWT required)

### Purpose
Get facets, facet values, and category-facet mappings for filtering

### Query Parameters
- `category_id=uuid` - Get facets for specific category
- `facet_group_id=uuid` - Get specific facet group
- `include_inactive=true` - Include inactive facets

### Example Request
```bash
# Get all facets
curl https://your-dashboard.example.com/api/catalog/facets

# Get facets for specific category
curl https://your-dashboard.example.com/api/catalog/facets?category_id=abc-123
```

### Example Response
```json
{
  "success": true,
  "data": {
    "facet_groups": [
      {
        "id": "uuid",
        "name": "Physical Attributes",
        "slug": "physical-attributes",
        "facets": [
          {
            "id": "uuid",
            "name": "Size",
            "slug": "size",
            "data_type": "select",
            "is_required": false,
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
      "category_id": "uuid",
      "required": [...],
      "optional": [...],
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

### JavaScript Example
```javascript
// Get facets for category
const categoryId = 'your-category-uuid';
const response = await fetch(
  `https://your-dashboard.example.com/api/catalog/facets?category_id=${categoryId}`
);
const { data } = await response.json();

// Render filter sidebar
data.category_details.required.forEach(facetMapping => {
  const facet = facetMapping.facet;
  renderFilter(facet.name, facet.values);
});
```

---

## All Active Edge Functions

| Function | Status | JWT Required | Purpose |
|----------|--------|--------------|---------|
| **get-catalog-navigation** | ✅ ACTIVE | No | Storefront menu structure |
| **get-catalog-taxonomy** | ✅ ACTIVE | No | Category hierarchy |
| **get-catalog-facets** | ✅ ACTIVE | No | Filters and attributes |
| create-payment-intent | ✅ ACTIVE | Yes | Payment processing |
| stripe-webhook | ✅ ACTIVE | No | Stripe events |
| send-email | ✅ ACTIVE | Yes | Email notifications |
| generate-invoice-pdf | ✅ ACTIVE | Yes | Invoice generation |
| generate-shipping-label | ✅ ACTIVE | Yes | Shipping labels |
| calculate-shipping-rates | ✅ ACTIVE | Yes | Shipping costs |
| inventory-alert-checker | ✅ ACTIVE | Yes | Stock alerts |
| create-admin | ✅ ACTIVE | Yes | Admin creation |
| generate-guidelines-pdf | ✅ ACTIVE | Yes | Guidelines PDF |
| get-shipping-rates | ✅ ACTIVE | Yes | Shipping rates |
| create-shipping-label | ✅ ACTIVE | Yes | Label creation |
| process-refund | ✅ ACTIVE | Yes | Refund processing |
| download-digital-product | ✅ ACTIVE | Yes | Digital downloads |
| create-automatic-payout | ✅ ACTIVE | Yes | Payout automation |
| create-stripe-connect-account | ✅ ACTIVE | Yes | Stripe Connect |
| create-vendor | ✅ ACTIVE | No | Vendor registration |

---

## CORS Configuration

All catalog APIs include CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Client-Info, Apikey
```

This allows cross-origin requests from any domain.

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server/database error

---

## Testing

### Test with cURL

```bash
# Test navigation API
curl https://your-dashboard.example.com/api/catalog/navigation | jq

# Test taxonomy API
curl https://your-dashboard.example.com/api/catalog/taxonomy | jq

# Test facets API
curl https://your-dashboard.example.com/api/catalog/facets | jq
```

### Test with Browser

Open browser console and run:

```javascript
// Test all three APIs
Promise.all([
  fetch('https://your-dashboard.example.com/api/catalog/navigation'),
  fetch('https://your-dashboard.example.com/api/catalog/taxonomy'),
  fetch('https://your-dashboard.example.com/api/catalog/facets')
]).then(responses =>
  Promise.all(responses.map(r => r.json()))
).then(results => {
  console.log('Navigation:', results[0]);
  console.log('Taxonomy:', results[1]);
  console.log('Facets:', results[2]);
});
```

### Test with Postman

1. Create new GET request
2. URL: `https://your-dashboard.example.com/api/catalog/navigation`
3. Send request
4. View JSON response

---

## Integration Checklist

- [ ] Replace `your-project` with actual Supabase project ID
- [ ] Test each endpoint in browser/Postman
- [ ] Implement caching (recommended: 1 hour TTL)
- [ ] Build navigation menu from API data
- [ ] Build category browser from taxonomy
- [ ] Build filter sidebar from facets
- [ ] Handle errors gracefully
- [ ] Monitor API performance
- [ ] Add loading states in UI

---

## Next Steps

1. **Get Your Project URL**
   - Find in Supabase Dashboard → Settings → API
   - Format: `https://<your-dashboard-host>`

2. **Test the APIs**
   - Use examples above in browser console
   - Verify data structure matches your needs

3. **Implement in Your App**
   - See `CATALOG_API_QUICK_START.md` for detailed examples
   - Use provided code snippets
   - Add caching layer

4. **Monitor Usage**
   - Check Supabase Dashboard → Edge Functions
   - Monitor invocation counts
   - Review execution times

---

## Documentation

**Detailed Guides:**
- `CATALOG_API_DOCUMENTATION.md` - Complete API reference
- `CATALOG_API_QUICK_START.md` - Quick start with examples
- `CATALOG_SYSTEM_COMPLETE.md` - Full system overview

**Admin Resources:**
- `CATALOG_RULES_VENDOR.md` - Vendor dashboard implementation
- `CATEGORY_SYSTEM_GUIDE.md` - Category management
- `FACET_FILTER_SYSTEM.md` - Facet system guide

---

## Support

**For API Issues:**
- Check Supabase Dashboard logs
- Verify project URL is correct
- Ensure CORS is not blocking requests
- Check network tab in browser DevTools

**For Data Issues:**
- Verify categories exist in Admin Dashboard
- Check is_active and show_in_navigation flags
- Ensure facets are assigned to categories
- Confirm RLS policies are correct

---

## Summary

✅ **3 Catalog APIs Deployed and Active**
✅ **Public Access - No Authentication Required**
✅ **CORS Enabled - Cross-Origin Ready**
✅ **Consistent JSON Response Format**
✅ **Comprehensive Error Handling**

**Status**: Production Ready
**Version**: 1.0.0
**Last Updated**: February 3, 2026
