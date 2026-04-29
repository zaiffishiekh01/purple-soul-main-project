# Facet/Filter System Documentation

## Overview

The Facet/Filter system provides dynamic, admin-controlled product attributes for storefront filtering. Facets are NOT categories or variants - they are filterable attributes like "Faith Tradition", "Material", "Purpose", etc.

## System Architecture

### Key Concepts

1. **Facet Groups**: Top-level filter categories (e.g., "Faith Tradition", "Material")
2. **Facet Values**: Individual options within a group (e.g., "Islamic", "Wood", "Silk")
3. **Category Mappings**: Controls which facets apply to which product categories
4. **Product Assignments**: Tracks which facet values are assigned to products

### Database Tables

#### facet_groups
```sql
CREATE TABLE facet_groups (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order integer,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
);
```

**Purpose:** Defines filter categories for the storefront

**Examples:**
- Faith Tradition
- Material
- Purpose
- Craft Origin
- Style
- Occasion
- Color Family

#### facet_values
```sql
CREATE TABLE facet_values (
  id uuid PRIMARY KEY,
  facet_group_id uuid REFERENCES facet_groups(id),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  display_order integer,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE(facet_group_id, slug)
);
```

**Purpose:** Individual options within each facet group

**Examples:**
- Faith Tradition: Islamic, Christian, Jewish, Buddhist, Hindu
- Material: Wood, Cotton, Silk, Wool, Metal, Stone, Glass
- Purpose: Prayer & Meditation, Home Decoration, Gift Giving

#### category_facets
```sql
CREATE TABLE category_facets (
  id uuid PRIMARY KEY,
  category_id uuid REFERENCES categories(id),
  facet_group_id uuid REFERENCES facet_groups(id),
  is_required boolean,
  created_at timestamptz,
  UNIQUE(category_id, facet_group_id)
);
```

**Purpose:** Maps which facet groups are available for which product categories

**Features:**
- Admins control which facets apply to each category
- Can mark facets as required or optional
- Vendors only see applicable facets when adding products

#### product_facets
```sql
CREATE TABLE product_facets (
  id uuid PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  facet_value_id uuid REFERENCES facet_values(id),
  created_at timestamptz,
  UNIQUE(product_id, facet_value_id)
);
```

**Purpose:** Tracks which facet values are assigned to each product

**Features:**
- Multi-select (products can have multiple values per facet group)
- Used for storefront filtering
- Does not affect SKU or pricing

## Admin Interface

### Accessing Facet Management

Navigate to: **Admin Dashboard → Facets** (need to add route)

The interface has 3 tabs:

### 1. Facet Groups Tab

**Purpose:** Manage top-level facet categories

**Actions:**
- View all facet groups
- Add new facet groups
- Edit existing groups (name, slug, description, order)
- Toggle active/inactive status
- Delete groups (cascades to values and mappings)

**Fields:**
- **Name:** Display name (e.g., "Faith Tradition")
- **Slug:** URL-friendly identifier (auto-generated)
- **Description:** Optional explanation
- **Display Order:** Sort order on storefront
- **Active:** Show/hide from vendors and storefront

### 2. Facet Values Tab

**Purpose:** Manage individual values within each facet group

**Workflow:**
1. Select a facet group from dropdown
2. View all values for that group
3. Add/edit/delete values

**Actions:**
- Add new values to selected group
- Edit value details
- Toggle active/inactive
- Delete values (removes from all products)

**Fields:**
- **Name:** Display name (e.g., "Islamic")
- **Slug:** URL-friendly identifier
- **Description:** Optional details
- **Display Order:** Sort order within group
- **Active:** Show/hide from selection

### 3. Category Mappings Tab

**Purpose:** Control which facets apply to which categories

**Workflow:**
1. Select a product category
2. Select a facet group
3. Check "Required" if vendors must select this facet
4. Create mapping

**Features:**
- View mappings grouped by category
- Toggle required/optional status
- Remove mappings

**Benefits:**
- Different categories can have different facets
- Example: "Digital Downloads" doesn't need "Material"
- Example: "Prayer Rugs" requires "Material"

## Vendor Experience

### Adding/Editing Products

When vendors create or edit a product:

1. **Select Category First**
   - Category determines which facets are available

2. **Facet Section Appears**
   - Only shows facets mapped to selected category
   - Groups marked as "Required" are highlighted
   - Multi-select checkboxes for each facet group

3. **Select Applicable Values**
   - Can select multiple values per group
   - Example: Material = "Cotton, Silk"
   - Example: Purpose = "Prayer & Meditation, Gift Giving"

4. **Save Product**
   - Facet assignments are saved automatically
   - Can be updated anytime

### Visual Design

The facet selector displays as:

```
┌─────────────────────────────────────────────────┐
│ Product Attributes & Filters                    │
│ Select applicable attributes for your product   │
├─────────────────────────────────────────────────┤
│ Faith Tradition [Required]                      │
│ ☐ Islamic  ☐ Christian  ☐ Jewish  ☐ Multi-Faith│
│                                                  │
│ Material [Required]                             │
│ ☐ Wood  ☐ Cotton  ☐ Silk  ☐ Metal  ☐ Stone    │
│                                                  │
│ Purpose                                          │
│ ☐ Prayer  ☐ Home Decor  ☐ Gift Giving          │
└─────────────────────────────────────────────────┘
```

## Storefront Implementation

### Filter Component

**Location:** `/src/components/StorefrontFilters.tsx`

**Usage:**
```typescript
import { StorefrontFilters } from './components/StorefrontFilters';

function ProductListing() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-1">
        <StorefrontFilters
          categoryId={categoryId}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
        />
      </div>
      <div className="col-span-3">
        {/* Product grid */}
      </div>
    </div>
  );
}
```

**Features:**
- Collapsible facet groups
- Multi-select checkboxes
- Selected count badges
- "Clear all" button
- Auto-loads based on category
- Responsive design

### Filtering Products

**Hook:** `useStorefrontFilters`

```typescript
import { useStorefrontFilters } from '../hooks/useStorefrontFilters';

const { facets, loading, error } = useStorefrontFilters(categoryId);
```

**API Function:** `getProductsByFilters`

```typescript
import { getProductsByFilters } from '../hooks/useStorefrontFilters';

const { products, total } = await getProductsByFilters(
  categoryId,      // Optional: filter by category
  facetValueIds,   // Array of selected facet value IDs
  50,              // Limit
  0                // Offset
);
```

**How It Works:**
1. User selects category (optional)
2. Filter component loads applicable facets
3. User checks desired filters
4. Frontend calls `getProductsByFilters` with selected IDs
5. Backend returns matching products

## Sample Data Included

### Facet Groups (7 total)
1. **Faith Tradition** - 7 values
2. **Purpose** - 7 values
3. **Material** - 11 values
4. **Craft Origin** - 7 values
5. **Style** - 6 values
6. **Occasion** - 6 values
7. **Color Family** - 8 values

### Pre-configured Mappings
- All leaf categories (categories without children) have default mappings
- Material is marked as required for physical products
- Other facets are optional

## Security (RLS Policies)

### facet_groups
- **Public:** Can view active groups
- **Authenticated:** Can view all groups
- **Admins:** Full CRUD access

### facet_values
- **Public:** Can view active values in active groups
- **Authenticated:** Can view all values
- **Admins:** Full CRUD access

### category_facets
- **Public:** Can view all mappings
- **Admins:** Full CRUD access

### product_facets
- **Public:** Can view all product facets
- **Vendors:** Can manage their own product facets
- **Admins:** Full CRUD access

## API Endpoints

### Get Facets for Category

```typescript
// Get applicable facet groups for a category
const { data } = await supabase
  .from('category_facets')
  .select(`
    facet_group_id,
    is_required,
    facet_group:facet_groups(*)
  `)
  .eq('category_id', categoryId);
```

### Get Facet Values

```typescript
// Get all values for specific facet groups
const { data } = await supabase
  .from('facet_values')
  .select('*')
  .in('facet_group_id', groupIds)
  .eq('is_active', true)
  .order('display_order');
```

### Get Product Facets

```typescript
// Get facet values assigned to a product
const { data } = await supabase
  .from('product_facets')
  .select('facet_value_id')
  .eq('product_id', productId);
```

### Filter Products

```typescript
// Get products matching selected facets
const { data } = await supabase
  .from('products')
  .select(`
    *,
    product_facets!inner(facet_value_id)
  `)
  .eq('status', 'active')
  .in('product_facets.facet_value_id', facetValueIds);
```

## Common Tasks

### Adding a New Facet Group

1. Go to **Admin → Facets → Facet Groups**
2. Click "Add Facet Group"
3. Enter name (e.g., "Size")
4. Set display order
5. Save

### Adding Values to a Facet Group

1. Go to **Admin → Facets → Facet Values**
2. Select the facet group
3. Click "Add Value"
4. Enter value name (e.g., "Small")
5. Set display order
6. Save

### Mapping Facets to Categories

1. Go to **Admin → Facets → Category Mappings**
2. Select a category
3. Select a facet group
4. Check "Required" if needed
5. Click "Create Mapping"

### Bulk Mapping

```sql
-- Map a facet to all leaf categories
INSERT INTO category_facets (category_id, facet_group_id, is_required)
SELECT c.id, 'facet-group-id', false
FROM categories c
WHERE NOT EXISTS (
  SELECT 1 FROM categories child WHERE child.parent_id = c.id
);
```

## Best Practices

### For Admins:

1. **Meaningful Names**
   - Use clear, customer-facing language
   - "Faith Tradition" not "Religion"
   - "Craft Origin" not "Manufacturing Location"

2. **Logical Grouping**
   - Keep related values in same group
   - Don't create too many groups (5-10 is ideal)
   - Order groups by importance

3. **Value Management**
   - Start with common values
   - Add more based on vendor requests
   - Remove unused values periodically

4. **Category Mapping**
   - Map facets to leaf categories (no children)
   - Only require truly essential facets
   - Similar categories should have similar facets

### For Vendors:

1. **Complete Profile**
   - Fill out all required facets
   - Be accurate - customers use these for filtering
   - Select all applicable values

2. **Multiple Values**
   - Select multiple when appropriate
   - Example: Material = "Cotton, Polyester" for blends
   - Example: Purpose = "Gift, Decoration"

3. **Consistency**
   - Use same facets for similar products
   - Check existing products in your category
   - Ask admin if unsure about values

## Troubleshooting

### Facets Not Showing for Vendor

**Issue:** Vendor doesn't see facet selector

**Checks:**
1. Is category selected?
2. Are there mappings for that category?
3. Are facet groups active?
4. Are facet values active?

**Fix:**
- Create category mappings in admin
- Activate facet groups/values

### Filters Not Appearing on Storefront

**Issue:** Storefront filter component empty

**Checks:**
1. Are facet groups active?
2. Are facet values active?
3. Is category passed correctly?
4. Are there products with facets?

**Fix:**
- Activate facets in admin
- Ensure products have facet assignments

### Products Not Showing in Filtered Results

**Issue:** Products missing from search results

**Checks:**
1. Do products have required facets assigned?
2. Are facet values active?
3. Is product status "active"?

**Fix:**
- Assign missing facets to products
- Check product and facet active status

## Migration from Old System

If you have existing products with text-based attributes:

```sql
-- Example: Migrate material field to facets
INSERT INTO product_facets (product_id, facet_value_id)
SELECT
  p.id,
  fv.id
FROM products p
JOIN facet_values fv ON fv.name = p.material
JOIN facet_groups fg ON fg.id = fv.facet_group_id
WHERE fg.slug = 'material'
AND p.material IS NOT NULL
ON CONFLICT DO NOTHING;
```

## Performance Considerations

### Indexes
All necessary indexes are created automatically:
- `idx_facet_values_group_id`
- `idx_category_facets_category_id`
- `idx_product_facets_product_id`
- `idx_product_facets_facet_value_id`

### Caching
Consider caching:
- Facet groups and values (change infrequently)
- Category-facet mappings
- Product counts per facet value

### Query Optimization
- Filter on category first, then facets
- Use `in` clause for multiple facet values
- Paginate results

## Future Enhancements

1. **Facet Analytics**
   - Track which facets are most used
   - Show product counts per value
   - Identify popular combinations

2. **Smart Suggestions**
   - Auto-suggest facets based on product title/description
   - Recommend similar products' facets
   - Learn from vendor patterns

3. **Hierarchical Facets**
   - Sub-values within values (if needed)
   - Example: Material > Wood > Oak, Maple

4. **Range Facets**
   - Price ranges
   - Size ranges
   - Numeric filters

5. **Visual Facets**
   - Color swatches
   - Pattern previews
   - Style thumbnails

## Files Created/Modified

### New Files:
- `/src/components/admin/AdminFacets.tsx`
- `/src/components/admin/AdminFacetGroups.tsx`
- `/src/components/admin/AdminFacetValues.tsx`
- `/src/components/admin/AdminCategoryFacets.tsx`
- `/src/components/ProductFacetSelector.tsx`
- `/src/components/StorefrontFilters.tsx`
- `/src/hooks/useProductFacets.ts`
- `/src/hooks/useStorefrontFilters.ts`
- `/supabase/migrations/create_facet_filter_system.sql`

### Modified Files:
- `/src/components/modals/ProductModal.tsx` (added facet selection)

## Support

For questions about the facet/filter system:
- Refer to this documentation
- Check database schema in migration file
- Review component source code
- Test with sample data included
