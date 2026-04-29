# Facet/Filter System Quick Reference

## For Admins

### Setup a New Facet (5 minutes)

1. **Create Facet Group**
   - Go to: Admin → Facets → Facet Groups
   - Click "Add Facet Group"
   - Name: "Size" (example)
   - Save

2. **Add Values**
   - Go to: Facet Values tab
   - Select your new group
   - Add values: "Small", "Medium", "Large"
   - Save each

3. **Map to Categories**
   - Go to: Category Mappings tab
   - Select category: "Fashion"
   - Select facet: "Size"
   - Check "Required" if needed
   - Create mapping

Done! Vendors can now use this facet.

### Quick Actions

**Disable a Facet Temporarily:**
- Facet Groups tab → Click status badge → Inactive

**Reorder Facets:**
- Edit facet → Change display_order number
- Lower numbers appear first

**Bulk Map to All Categories:**
```sql
INSERT INTO category_facets (category_id, facet_group_id, is_required)
SELECT c.id, 'your-facet-group-id', false
FROM categories c;
```

## For Vendors

### Adding Facets to Product

1. Select category first
2. Scroll to "Product Attributes & Filters" section
3. Check all applicable boxes
4. Required facets are highlighted
5. Save product

### Best Practices

**Be Accurate:**
- Customers use these to find products
- Wrong facets = lost sales

**Select Multiple:**
- Material: "Cotton, Silk" for blends
- Purpose: "Gift, Decor" when both apply

**Check Similar Products:**
- See what others in your category use
- Be consistent

## For Storefront Developers

### Basic Implementation

```typescript
import { StorefrontFilters } from './components/StorefrontFilters';
import { getProductsByFilters } from './hooks/useStorefrontFilters';

function ProductPage() {
  const [filters, setFilters] = useState<string[]>([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProductsByFilters(null, filters).then(({ products }) => {
      setProducts(products);
    });
  }, [filters]);

  return (
    <div className="grid grid-cols-4 gap-6">
      <StorefrontFilters
        categoryId={null}
        selectedFilters={filters}
        onFilterChange={setFilters}
      />
      <ProductGrid products={products} />
    </div>
  );
}
```

### Category-Specific Filters

```typescript
<StorefrontFilters
  categoryId="category-uuid"  // Only show facets for this category
  selectedFilters={filters}
  onFilterChange={setFilters}
/>
```

### Manual Filter Query

```typescript
const { data } = await supabase
  .from('products')
  .select(`*, product_facets!inner(facet_value_id)`)
  .in('product_facets.facet_value_id', ['facet-val-1', 'facet-val-2'])
  .eq('status', 'active');
```

## Common Scenarios

### Scenario 1: Add "Eco-Friendly" Filter

1. **Admin:** Create facet group "Sustainability"
2. **Admin:** Add values: "Eco-Friendly", "Organic", "Recycled"
3. **Admin:** Map to relevant categories
4. **Vendors:** Select when applicable
5. **Storefront:** Auto-appears in filters

### Scenario 2: Required Material for Physical Products

1. **Admin:** Go to Category Mappings
2. **Admin:** For each physical product category:
   - Map "Material" facet
   - Check "Required"
3. **Vendors:** Must select material to save product

### Scenario 3: Filter by Multiple Facets

```typescript
// User selects: Islamic + Wood + Prayer
const selectedFacets = [
  'islamic-facet-id',
  'wood-facet-id',
  'prayer-facet-id'
];

const { products } = await getProductsByFilters(null, selectedFacets);
// Returns only products matching ALL selected facets
```

## Data Checks

### Check Facet Setup

```sql
-- See all facet groups and value counts
SELECT
  fg.name,
  COUNT(fv.id) as values,
  fg.is_active
FROM facet_groups fg
LEFT JOIN facet_values fv ON fv.facet_group_id = fg.id
GROUP BY fg.id, fg.name, fg.is_active;
```

### Check Category Mappings

```sql
-- See which categories have which facets
SELECT
  c.name as category,
  fg.name as facet_group,
  cf.is_required
FROM category_facets cf
JOIN categories c ON c.id = cf.category_id
JOIN facet_groups fg ON fg.id = cf.facet_group_id
ORDER BY c.name, fg.display_order;
```

### Check Product Facets

```sql
-- See facets assigned to a product
SELECT
  p.name as product,
  fg.name as facet_group,
  fv.name as facet_value
FROM products p
JOIN product_facets pf ON pf.product_id = p.id
JOIN facet_values fv ON fv.id = pf.facet_value_id
JOIN facet_groups fg ON fg.id = fv.facet_group_id
WHERE p.id = 'product-id';
```

## Troubleshooting

### Problem: Vendor can't see facets

**Solution:**
```sql
-- Check if category has facet mappings
SELECT fg.name
FROM category_facets cf
JOIN facet_groups fg ON fg.id = cf.facet_group_id
WHERE cf.category_id = 'category-id';
```

### Problem: Filters not showing on storefront

**Check:**
1. Are facet groups active? ✓
2. Are facet values active? ✓
3. Do products have facets assigned? ✓

**Fix:** Activate facets or assign to products

### Problem: No products in filtered results

**Reason:** Products might not have the selected facets

**Solution:** Ensure products have facet assignments

## Tips & Tricks

### Admin Tips:

1. **Start Small:** 5-7 facet groups is plenty
2. **Clear Names:** "Faith Tradition" not "Religion Type"
3. **Order Matters:** Most important facets first
4. **Test Filter:** Log in as vendor and try it
5. **Monitor Usage:** Check which facets customers use most

### Vendor Tips:

1. **Complete Profile:** Don't skip optional facets
2. **Be Specific:** Select all that apply
3. **Check Competitors:** See what they select
4. **Update Regularly:** Add new facets when available
5. **Ask Admin:** Request new values if needed

### Developer Tips:

1. **Cache Facets:** They rarely change
2. **Paginate Results:** Don't load all products
3. **Show Counts:** Display product count per facet
4. **Clear Filters:** Always provide a clear button
5. **Mobile First:** Filters work great in drawer/modal

## Sample Data Available

After migration, you have:

- **7 Facet Groups** with **52 total values**
- **19 Categories** mapped with **114 mappings**
- Ready to use immediately

Example groups:
- Faith Tradition (7 values)
- Material (11 values)
- Purpose (7 values)
- Craft Origin (7 values)

## Next Steps

### For Admins:
1. Review existing facet groups
2. Add/remove values as needed
3. Adjust category mappings
4. Train vendors on usage

### For Vendors:
1. Edit existing products
2. Add facet assignments
3. Create new products with facets
4. Monitor customer searches

### For Developers:
1. Integrate StorefrontFilters component
2. Wire up filter state management
3. Test filtering functionality
4. Add product count per facet (optional)
5. Implement facet analytics (optional)

## Links to Full Documentation

- Full Documentation: `FACET_FILTER_SYSTEM.md`
- Database Schema: `supabase/migrations/create_facet_filter_system.sql`
- Component Code: `src/components/admin/AdminFacets.tsx`
- Storefront Component: `src/components/StorefrontFilters.tsx`
