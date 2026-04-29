# Category System Quick Reference Guide

## For Admins

### Managing Category Groups
1. Navigate to: **Admin Dashboard → Categories → Category Groups**
2. Here you can:
   - View all 7 flat category groups
   - Edit group details (name, description, icon)
   - Toggle active/inactive status
   - Delete custom groups (system groups are protected)

### Managing Catalog Taxonomy
1. Navigate to: **Admin Dashboard → Categories → Catalog Taxonomy**
2. Features:
   - **Tree View:** See hierarchical structure
   - **Add Root Category:** Create top-level categories
   - **Add Subcategory:** Click + icon on any category
   - **Edit Category:** Click edit icon
   - **Delete Category:** Click trash icon (deletes all children)
   - **Expand/Collapse:** Click arrow to show/hide children

3. Category Fields:
   - **Name:** Display name (e.g., "Hijabs & Scarves")
   - **Slug:** URL-friendly identifier (auto-generated)
   - **Icon:** Emoji representation
   - **Description:** Brief explanation
   - **Display Order:** Sort order within parent
   - **Active:** Show/hide from vendors

### Managing Mappings
1. Navigate to: **Admin Dashboard → Categories → Mappings**
2. Purpose: Connect taxonomy categories to category groups
3. Steps:
   - Select a taxonomy category from dropdown
   - Select a category group from dropdown
   - Click "Create Mapping"
4. View:
   - Mappings grouped by category group
   - Delete unwanted mappings

## For Vendors

### Adding/Editing Products
1. When creating or editing a product, you'll see:
   ```
   Select Category *
   ┌─────────────────────────────────────┐
   │ Choose a category...                │
   │ 🎨 Islamic Art                      │
   │   └─ 📦 Calligraphy                │
   │   └─ 📦 Geometric Patterns          │
   │   └─ 📦 Canvas Prints               │
   │ 👗 Fashion                          │
   │   └─ 📦 Hijabs & Scarves            │
   │   └─ 📦 Abayas                      │
   └─────────────────────────────────────┘
   ```

2. Select the most specific category:
   - Choose subcategories when available
   - Example: "Hijabs & Scarves" instead of just "Fashion"

3. Category group is assigned automatically:
   - You don't need to select it
   - It's mapped in the background

## Common Tasks

### Adding a New Product Category

**As Admin:**

1. Go to **Categories → Catalog Taxonomy**
2. Decide if it's a root category or subcategory
3. Click appropriate button:
   - "Add Root Category" for top-level
   - "+" icon on parent for subcategory
4. Fill in details and save
5. Go to **Mappings** tab
6. Map the new category to a category group

**Now Vendors Can Use It:**
- New category appears in product forms
- Vendors can select it when creating products

### Reorganizing Categories

**Moving Categories:**
1. Currently requires database update
2. Change the `parent_id` of the category
3. Or delete and recreate in new location

**Reordering Categories:**
1. Edit the category
2. Change the `display_order` number
3. Lower numbers appear first

### Deactivating a Category

**Temporarily Hide:**
1. Go to **Catalog Taxonomy**
2. Click edit on the category
3. Uncheck "Active"
4. Save

**Effect:**
- Category disappears from vendor dropdowns
- Existing products keep their category
- Can be reactivated anytime

### Checking Category Usage

**SQL Query:**
```sql
SELECT
  c.name,
  COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY product_count DESC;
```

## Best Practices

### For Admins:

1. **Consistent Naming:**
   - Use clear, descriptive names
   - Follow existing naming patterns
   - Use title case

2. **Logical Hierarchy:**
   - Keep tree depth reasonable (2-3 levels)
   - Group related items together
   - Don't create too many root categories

3. **Regular Maintenance:**
   - Review unused categories
   - Merge similar categories
   - Update descriptions

4. **Mapping Strategy:**
   - Map all leaf categories (no children)
   - Parent categories can also have mappings
   - One taxonomy category → one group

### For Vendors:

1. **Choose Specific:**
   - Pick the most specific category available
   - Example: "Canvas Prints" not "Islamic Art"

2. **Consistency:**
   - Use same category for similar products
   - Check existing products for reference

3. **When Unsure:**
   - Choose parent category
   - Contact admin for new categories
   - Don't guess - accuracy matters

## Troubleshooting

### Category Not Showing in Vendor Dropdown

**Check:**
1. Is category active? (Admin → Taxonomy → Edit category)
2. Is it marked `is_active = true`?
3. Did vendor refresh the page?

**Fix:**
- Activate the category
- Vendor refreshes product form

### Product Saved But Category Empty

**Issue:** Vendor forgot to select category

**Fix:**
- Edit product
- Select category from dropdown
- Save again

### Want to Move Products to Different Category

**Bulk Update:**
```sql
-- Move all products from old to new category
UPDATE products
SET category_id = 'new-category-id'
WHERE category_id = 'old-category-id';
```

### Taxonomy Category Missing Mapping

**Symptom:** Category works but products don't show in group reports

**Fix:**
1. Go to **Mappings** tab
2. Find the unmapped category
3. Create mapping to appropriate group

## Data Verification

### Check System Health

```sql
-- Categories without mappings
SELECT c.name
FROM categories c
LEFT JOIN category_group_mappings cgm ON cgm.category_id = c.id
WHERE cgm.id IS NULL;

-- Products without category_id
SELECT id, name, category
FROM products
WHERE category_id IS NULL;

-- Verify mapping counts
SELECT
  cg.name,
  COUNT(cgm.id) as mapped_count
FROM category_groups cg
LEFT JOIN category_group_mappings cgm ON cgm.group_id = cg.id
GROUP BY cg.id, cg.name;
```

## Migration Notes

### Existing Products
- Old products use `category` (text field)
- New products use `category_id` (UUID reference)
- Both work simultaneously
- Gradual migration possible

### Backward Compatibility
- Old category field remains
- Reports still work
- No breaking changes
- Vendors see new system only

## Support

**For Issues:**
1. Check this guide first
2. Review HYBRID_CATEGORY_SYSTEM.md for technical details
3. Check database directly if needed
4. Test in staging first

**For Feature Requests:**
- Document the use case
- Consider existing alternatives
- Propose specific solution
- Consider impact on vendors
