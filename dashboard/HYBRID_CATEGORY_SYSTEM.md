# Hybrid Category System Implementation

## Overview

The platform now uses a **hybrid category system** that combines flat category groups with hierarchical taxonomy for better product organization and flexibility.

## System Architecture

### 1. Category Groups (Flat Structure)
- **Table:** `category_groups`
- **Purpose:** Top-level groupings for platform-wide organization (7 main groups)
- **Usage:** Backend classification, reporting, analytics
- **Examples:**
  - Art & Wall Decor
  - Jewelry & Accessories
  - Home & Living
  - Fashion & Apparel
  - Wellness & Meditation
  - Digital Books
  - Audio Spectrum

### 2. Catalog Taxonomy (Hierarchical Structure)
- **Table:** `categories`
- **Purpose:** Detailed, hierarchical product categorization
- **Features:**
  - Tree structure with `parent_id`
  - Automatic level and path tracking
  - Unlimited depth
  - Icon support per category
- **Examples:**
  ```
  Islamic Art (Root)
  ├── Calligraphy
  ├── Geometric Patterns
  ├── Canvas Prints
  └── Wall Art

  Fashion (Root)
  ├── Hijabs & Scarves
  ├── Abayas
  ├── Modest Dresses
  └── Men's Wear
  ```

### 3. Category Group Mappings
- **Table:** `category_group_mappings`
- **Purpose:** Maps taxonomy nodes to category groups
- **Relationship:** Many-to-one (multiple taxonomy categories can map to one group)
- **Benefits:**
  - Flexible categorization
  - Easy migration path
  - Maintains backward compatibility

## Database Schema

### category_groups
```sql
CREATE TABLE category_groups (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  display_order integer,
  is_active boolean,
  is_system boolean,
  created_at timestamptz,
  updated_at timestamptz
);
```

### categories
```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY,
  parent_id uuid REFERENCES categories(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  display_order integer,
  is_active boolean,
  level integer,
  path text,
  created_at timestamptz,
  updated_at timestamptz
);
```

### category_group_mappings
```sql
CREATE TABLE category_group_mappings (
  id uuid PRIMARY KEY,
  category_id uuid REFERENCES categories(id),
  group_id uuid REFERENCES category_groups(id),
  created_at timestamptz,
  UNIQUE(category_id, group_id)
);
```

### products
```sql
ALTER TABLE products
ADD COLUMN category_id uuid REFERENCES categories(id);
-- Note: 'category' text field remains for backward compatibility
```

## Admin UI Components

### 1. Category Groups Manager
**Path:** Admin Dashboard > Categories > Category Groups

**Features:**
- View all flat category groups
- Add/edit/delete groups (non-system only)
- Toggle active status
- Reorder display

**Access:** `/admin/categories` (Category Groups tab)

### 2. Catalog Taxonomy Manager
**Path:** Admin Dashboard > Categories > Catalog Taxonomy

**Features:**
- Tree view of hierarchical categories
- Expand/collapse nodes
- Add root categories
- Add subcategories to any node
- Edit category details (name, slug, icon, description)
- Delete categories (cascades to children)
- Visual hierarchy with indentation

**Access:** `/admin/categories` (Catalog Taxonomy tab)

### 3. Category Mappings Manager
**Path:** Admin Dashboard > Categories > Mappings

**Features:**
- View all mappings grouped by category group
- Create new mappings (taxonomy → group)
- Delete existing mappings
- See how many categories map to each group

**Access:** `/admin/categories` (Mappings tab)

## Vendor Experience

### Product Creation/Editing
When vendors add or edit products:

1. **Category Selection:**
   - Hierarchical dropdown showing full taxonomy
   - Visual indentation shows parent-child relationships
   - Icons help identify categories quickly
   - Example: `└─ 🎨 Calligraphy` under `Islamic Art`

2. **Automatic Group Assignment:**
   - Category group is derived from taxonomy mapping
   - Vendor doesn't manually select the group
   - Transparent to vendor - they only see taxonomy

3. **Form Fields:**
   - `category_id`: Selected taxonomy category (required)
   - `category`: Category name (auto-filled, for display)

## Migration Strategy

### Existing Products
Products with the old `category` text field will continue to work:
- Old field remains for backward compatibility
- New products use `category_id`
- Gradual migration can happen in background

### Data Migration Query
```sql
-- Example: Migrate products from old text categories to new taxonomy
UPDATE products
SET category_id = (
  SELECT c.id
  FROM categories c
  WHERE c.name = products.category
  LIMIT 1
)
WHERE category_id IS NULL;
```

## Benefits

### For Admins:
1. **Flexible Organization:** Create detailed, nested categories
2. **Easy Mapping:** Connect taxonomy to flat groups for reporting
3. **Scalability:** Add unlimited subcategories
4. **Control:** Manage both systems independently

### For Vendors:
1. **Better Discovery:** Find the right category easily
2. **Specific Categories:** More precise product classification
3. **Simple Interface:** Just pick from a hierarchical list
4. **Automatic Grouping:** Don't worry about backend classification

### For Platform:
1. **Backward Compatible:** No breaking changes
2. **Future-Proof:** Can expand taxonomy as needed
3. **Better SEO:** More specific categorization
4. **Analytics:** Group-level reporting still works

## Sample Data Included

The migration includes sample data:

### Root Categories:
- Islamic Art
- Home Decor
- Fashion
- Books & Media
- Wellness
- Jewelry

### Example Subcategories:
- Islamic Art → Calligraphy, Geometric Patterns, Canvas Prints, Wall Art
- Fashion → Hijabs & Scarves, Abayas, Modest Dresses, Men's Wear
- Books & Media → Quran & Tafsir, Islamic History, Children's Books, Audio Books

### Pre-configured Mappings:
All taxonomy categories are mapped to appropriate category groups.

## API Usage

### Get All Taxonomy Categories (Flat)
```typescript
const { data } = await dashboardClient
  .from('categories')
  .select('*')
  .eq('is_active', true)
  .order('level')
  .order('display_order');
```

### Get Taxonomy Tree
```typescript
import { useCatalogTaxonomy } from './hooks/useCatalogTaxonomy';

const { categories, loading } = useCatalogTaxonomy();
// Returns tree structure with parent-child relationships
```

### Get Category with Group
```sql
SELECT
  c.*,
  cg.name as group_name,
  cg.slug as group_slug
FROM categories c
LEFT JOIN category_group_mappings cgm ON cgm.category_id = c.id
LEFT JOIN category_groups cg ON cg.id = cgm.group_id
WHERE c.id = 'category-id';
```

## Security (RLS Policies)

### Category Groups
- Anyone can view active groups
- Only admins can manage groups

### Categories
- Anyone can view active categories
- Authenticated users can view all categories
- Only admins can manage categories

### Category Group Mappings
- Anyone can view mappings
- Only admins can manage mappings

## Future Enhancements

1. **Category Attributes:** Add custom fields per category
2. **Category Rules:** Define validation rules per category
3. **Auto-tagging:** Suggest tags based on category
4. **Category Analytics:** Track product distribution
5. **Multi-mapping:** Allow one taxonomy node → multiple groups
6. **Category Images:** Hero images for category pages

## Testing

To test the hybrid system:

1. **Login as Admin:**
   - Go to Categories section
   - Try all three tabs
   - Create a new taxonomy category
   - Map it to a group

2. **Login as Vendor:**
   - Add/edit a product
   - Select category from hierarchical dropdown
   - Notice automatic group assignment

3. **Verify Data:**
   ```sql
   -- Check product has both category and category_id
   SELECT id, name, category, category_id FROM products;

   -- Check mapping works
   SELECT
     c.name as category,
     cg.name as group
   FROM categories c
   JOIN category_group_mappings cgm ON cgm.category_id = c.id
   JOIN category_groups cg ON cg.id = cgm.group_id;
   ```

## Files Modified/Created

### New Files:
- `/src/components/admin/AdminCatalogTaxonomy.tsx`
- `/src/components/admin/AdminCategoryMappings.tsx`
- `/src/components/admin/AdminCategoryGroups.tsx`
- `/src/hooks/useCatalogTaxonomy.ts`
- `/postgres/migrations/create_hybrid_category_system.sql`

### Modified Files:
- `/src/components/admin/AdminCategories.tsx` (now has tabs)
- `/src/components/modals/ProductModal.tsx` (uses taxonomy selector)

## Support

For questions or issues with the hybrid category system, refer to:
- This documentation
- Database migration file for schema details
- Component source code for UI implementation
