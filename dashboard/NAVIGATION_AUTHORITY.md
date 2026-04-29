# Navigation Authority - Admin Dashboard as Publisher

## Critical Principle

The Admin Dashboard is the **SINGLE SOURCE OF TRUTH** for all storefront navigation. Storefronts MUST consume the navigation API read-only and NEVER override or use fallback/hardcoded labels.

---

## Authority Model

```
┌─────────────────────────────────────────────────┐
│         ADMIN DASHBOARD (THIS PROJECT)          │
│              AUTHORITATIVE PUBLISHER             │
├─────────────────────────────────────────────────┤
│                                                  │
│  Component: AdminNavigation                     │
│  Route: /admin/navigation                       │
│                                                  │
│  Admin Controls:                                │
│  ✅ menu_label (navigation_label column)        │
│  ✅ menu_order (display_order column)           │
│  ✅ show_in_navigation (boolean)                │
│  ✅ route_slug (url_slug_override or slug)      │
│  ✅ is_featured (homepage highlighting)         │
│  ✅ mega_menu_enabled (dropdown style)          │
│                                                  │
│             ↓ PUBLISHES TO ↓                    │
│                                                  │
│  Edge Function: get-catalog-navigation          │
│  Endpoint: /functions/v1/get-catalog-navigation │
│                                                  │
│  Returns:                                        │
│  • navigation tree (hierarchical)               │
│  • featured categories (ordered)                │
│  • static links (custom pages)                  │
│                                                  │
└─────────────────┬───────────────────────────────┘
                  │
                  │ READ-ONLY API
                  ↓
      ┌───────────────────────┐
      │   STOREFRONT APPS     │
      │   (READ-ONLY CONSUMER)│
      ├───────────────────────┤
      │                       │
      │  ❌ CANNOT create     │
      │     navigation        │
      │  ❌ CANNOT override   │
      │     labels            │
      │  ❌ CANNOT use        │
      │     fallbacks         │
      │  ✅ MUST use exactly  │
      │     what API returns  │
      │                       │
      └───────────────────────┘
```

---

## Database Schema

### Categories Table (Navigation Authority)

```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY,
  parent_id uuid REFERENCES categories(id),

  -- Basic Info
  name text NOT NULL,                    -- Internal category name
  slug text UNIQUE NOT NULL,             -- Default URL slug
  description text,
  icon text,

  -- Hierarchy
  level integer DEFAULT 0,
  path text,

  -- Display Order
  display_order integer DEFAULT 0,       -- ⭐ Used as menu_order

  -- Navigation Control
  show_in_navigation boolean DEFAULT true,    -- ⭐ Menu visibility
  navigation_label text DEFAULT '',           -- ⭐ Custom menu label (overrides name)
  url_slug_override text DEFAULT '',          -- ⭐ Custom route slug

  -- Featured Control
  is_featured boolean DEFAULT false,
  featured_order integer DEFAULT 0,

  -- Mega Menu
  mega_menu_enabled boolean DEFAULT false,
  mega_menu_columns integer DEFAULT 3,

  -- SEO
  seo_title text,
  seo_description text,
  seo_keywords text,

  -- Status
  is_active boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Key Navigation Fields

| Database Column | API Field | Purpose | Example |
|----------------|-----------|---------|---------|
| `navigation_label` | `menu_label` | Custom label for navigation menu | "Shop Fashion" instead of "Fashion" |
| `display_order` | `menu_order` | Sort order in navigation | 1, 2, 3... |
| `show_in_navigation` | `show_in_navigation` | Include in menu? | true/false |
| `url_slug_override` | `route_slug` | Custom URL path | "modest-fashion" instead of "fashion" |
| `slug` | `route_slug` (fallback) | Default URL if no override | "fashion" |
| `name` | `menu_label` (fallback) | Default label if no override | "Fashion" |

---

## API Response Structure

### GET /functions/v1/get-catalog-navigation

**Response:**
```json
{
  "success": true,
  "data": {
    "navigation": [
      {
        "id": "uuid",
        "name": "Fashion",
        "menu_label": "Shop Fashion",        // ⭐ Use this for display
        "slug": "fashion",
        "route_slug": "modest-fashion",      // ⭐ Use this for URLs
        "icon": "👗",
        "level": 0,
        "menu_order": 1,                     // ⭐ Use for sorting
        "show_in_navigation": true,
        "is_featured": true,
        "mega_menu_enabled": false,
        "mega_menu_columns": 3,
        "parent_id": null,
        "children": [
          {
            "id": "uuid",
            "name": "Abayas",
            "menu_label": "Abayas & Jilbabs",
            "route_slug": "abayas-jilbabs",
            "level": 1,
            "menu_order": 1,
            "children": []
          }
        ]
      }
    ],
    "featured": [
      {
        "id": "uuid",
        "name": "Fashion",
        "menu_label": "Shop Fashion",
        "route_slug": "modest-fashion",
        "icon": "👗",
        "description": "Modest fashion for every occasion",
        "featured_order": 1
      }
    ],
    "static_links": [
      {
        "id": "uuid",
        "label": "About Us",
        "url": "/about",
        "display_order": 100,
        "is_active": true
      }
    ]
  },
  "meta": {
    "total_categories": 15,
    "featured_count": 5,
    "static_links_count": 3,
    "generated_at": "2026-02-03T10:00:00Z",
    "authority": "Admin Dashboard is the SINGLE SOURCE OF TRUTH for navigation",
    "note": "Use menu_label and route_slug for navigation rendering. Never use fallback or hardcoded labels."
  }
}
```

---

## Admin UI Controls

### Location
**Route:** `/admin/navigation`
**Component:** `src/components/admin/AdminNavigation.tsx`

### Four Control Tabs

#### 1. Featured Categories
**Purpose:** Control homepage featured sections

**Controls:**
- Toggle featured status (on/off)
- Set featured order (1, 2, 3...)
- Preview featured order

**Effect on API:**
- Updates `is_featured` field
- Updates `featured_order` field
- Changes `data.featured` array in response

#### 2. Navigation Menu
**Purpose:** Control main navigation menu

**Controls:**
- Toggle visibility (show/hide in menu)
- Set custom navigation label
- Preview navigation hierarchy

**Effect on API:**
- Updates `show_in_navigation` field
- Updates `navigation_label` field
- Changes `data.navigation` array in response

**Example:**
```
Category: "Fashion"
Navigation Label: "Shop Fashion"
Show in Navigation: ✓ Yes

Result: Menu shows "Shop Fashion" instead of "Fashion"
```

#### 3. Mega Menu
**Purpose:** Configure dropdown menu style

**Controls:**
- Toggle mega menu (standard vs mega)
- Set column count (2, 3, or 4)

**Effect on API:**
- Updates `mega_menu_enabled` field
- Updates `mega_menu_columns` field
- Storefront can render multi-column dropdowns

#### 4. SEO & URLs
**Purpose:** Optimize search and customize URLs

**Controls:**
- SEO title (meta title)
- Meta description
- Keywords
- Custom URL slug

**Effect on API:**
- Updates `url_slug_override` field
- Changes `route_slug` in response

**Example:**
```
Category: "Fashion"
Default Slug: "fashion"
Custom URL: "modest-fashion"

Result: Routes to /modest-fashion instead of /fashion
```

---

## Rules & Enforcement

### Rule 1: Admin-Defined Labels Are Authoritative

**Definition:**
- If `navigation_label` is set, use it for menu display
- Never fall back to category `name` when `menu_label` is provided
- Never use hardcoded or localized labels

**Enforcement:**
- API returns `menu_label` (admin-defined or defaults to name)
- Storefront MUST use `menu_label` exactly as returned
- No conditional logic like `menu_label || name || 'fallback'`

**Example:**
```javascript
// ❌ WRONG - Using fallbacks
const label = item.menu_label || item.name || 'Category';

// ❌ WRONG - Hardcoded overrides
const label = item.slug === 'fashion' ? 'Shop Fashion' : item.name;

// ✅ CORRECT - Use API value exactly
const label = item.menu_label;
```

### Rule 2: Menu Order Is Authoritative

**Definition:**
- Categories are sorted by `menu_order` (from `display_order`)
- Admin controls exact sequence
- No alphabetical sorting or arbitrary reordering

**Enforcement:**
- API returns items sorted by `menu_order`
- Storefront renders in exact order received
- No client-side re-sorting

**Example:**
```javascript
// ❌ WRONG - Re-sorting
navigation.sort((a, b) => a.name.localeCompare(b.name));

// ❌ WRONG - Ignoring order
navigation.reverse();

// ✅ CORRECT - Use order as-is
navigation.forEach(item => renderMenuItem(item));
```

### Rule 3: Visibility Is Authoritative

**Definition:**
- Only items with `show_in_navigation: true` appear in menus
- API filters automatically
- Storefront should not re-filter or add items

**Enforcement:**
- API returns only visible items
- Storefront trusts the list
- No "show all" or "include hidden" options

**Example:**
```javascript
// ❌ WRONG - Trying to fetch hidden items
const allCategories = await fetch('/api/taxonomy?include_inactive=true');

// ❌ WRONG - Adding non-navigation items
navigation.push({ name: 'Custom Item', ... });

// ✅ CORRECT - Use navigation as-is
const { data } = await fetch('/api/catalog/navigation');
renderMenu(data.navigation);
```

### Rule 4: Route Slugs Are Authoritative

**Definition:**
- Use `route_slug` for all category links
- Admin can override default slugs
- No slug transformation or manipulation

**Enforcement:**
- API returns `route_slug` (override or default)
- Storefront uses it for href attributes
- No slug concatenation or modification

**Example:**
```javascript
// ❌ WRONG - Transforming slug
const url = `/category/${item.slug.toLowerCase().replace(/\s/g, '-')}`;

// ❌ WRONG - Using wrong field
const url = `/category/${item.name}`;

// ✅ CORRECT - Use route_slug
const url = `/category/${item.route_slug}`;
```

---

## Workflow Examples

### Example 1: Admin Changes Menu Label

**Admin Action:**
1. Go to `/admin/navigation`
2. Click "Navigation Menu" tab
3. Find "Islamic Art" category
4. Click "Edit Label"
5. Enter "Shop Islamic Art"
6. Click "Save"

**Database Update:**
```sql
UPDATE categories
SET navigation_label = 'Shop Islamic Art'
WHERE id = 'uuid';
```

**API Response Change:**
```json
// BEFORE
{
  "name": "Islamic Art",
  "menu_label": "Islamic Art",
  ...
}

// AFTER
{
  "name": "Islamic Art",
  "menu_label": "Shop Islamic Art",
  ...
}
```

**Storefront Impact:**
- Navigation menu immediately shows "Shop Islamic Art"
- Breadcrumbs show "Shop Islamic Art"
- All references use admin-defined label

---

### Example 2: Admin Hides Category from Menu

**Admin Action:**
1. Go to `/admin/navigation`
2. Click "Navigation Menu" tab
3. Find "Test Category"
4. Click visibility toggle
5. Status changes to "Hidden"

**Database Update:**
```sql
UPDATE categories
SET show_in_navigation = false
WHERE id = 'uuid';
```

**API Response Change:**
```json
// BEFORE - Category in response
{
  "navigation": [
    { "id": "uuid", "name": "Test Category", ... }
  ]
}

// AFTER - Category removed from response
{
  "navigation": []
}
```

**Storefront Impact:**
- "Test Category" disappears from all menus
- Products in that category still accessible via search/direct links
- Category page still exists, just not linked in navigation

---

### Example 3: Admin Changes URL Slug

**Admin Action:**
1. Go to `/admin/navigation`
2. Click "SEO & URLs" tab
3. Find "Fashion" category
4. Click "Edit SEO"
5. Set "Custom URL Slug" to "modest-fashion"
6. Click "Save SEO Settings"

**Database Update:**
```sql
UPDATE categories
SET url_slug_override = 'modest-fashion'
WHERE id = 'uuid';
```

**API Response Change:**
```json
// BEFORE
{
  "slug": "fashion",
  "route_slug": "fashion",
  ...
}

// AFTER
{
  "slug": "fashion",
  "route_slug": "modest-fashion",
  ...
}
```

**Storefront Impact:**
- Links change from `/category/fashion` to `/category/modest-fashion`
- Old URL can redirect to new URL
- SEO improvements with descriptive URL

---

## Storefront Integration

### Correct Implementation

```javascript
// Fetch navigation on app load
async function initNavigation() {
  const response = await fetch(
    'https://project.supabase.co/functions/v1/get-catalog-navigation'
  );
  const { data } = await response.json();

  return data;
}

// Render navigation menu
function renderNavMenu(navigation) {
  return (
    <nav>
      {navigation.map(item => (
        <a
          key={item.id}
          href={`/category/${item.route_slug}`}
        >
          {item.icon} {item.menu_label}
        </a>
      ))}
    </nav>
  );
}

// Render featured categories
function renderFeatured(featured) {
  return (
    <section>
      <h2>Featured Categories</h2>
      <div className="grid">
        {featured.map(item => (
          <a
            key={item.id}
            href={`/category/${item.route_slug}`}
          >
            <div className="featured-card">
              <span className="icon">{item.icon}</span>
              <h3>{item.menu_label}</h3>
              <p>{item.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
```

### Incorrect Implementation (DO NOT DO)

```javascript
// ❌ WRONG - Hardcoded labels
function renderNavMenu(navigation) {
  return (
    <nav>
      <a href="/fashion">Fashion</a>
      <a href="/home-decor">Home Decor</a>
      <a href="/books">Books</a>
    </nav>
  );
}

// ❌ WRONG - Fallback logic
function renderNavMenu(navigation) {
  return navigation.map(item => (
    <a href={`/${item.slug}`}>
      {item.menu_label || item.name || 'Unnamed'}
    </a>
  ));
}

// ❌ WRONG - Re-sorting
function renderNavMenu(navigation) {
  const sorted = [...navigation].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  return sorted.map(renderItem);
}

// ❌ WRONG - Filtering on client
function renderNavMenu(navigation) {
  const visible = navigation.filter(item =>
    item.show_in_navigation && item.is_active
  );
  return visible.map(renderItem);
}
```

---

## Cache Strategy

### Recommended Client-Side Caching

```javascript
class NavigationCache {
  constructor() {
    this.cache = null;
    this.timestamp = 0;
    this.ttl = 1000 * 60 * 60; // 1 hour
  }

  async getNavigation() {
    const now = Date.now();

    if (this.cache && (now - this.timestamp) < this.ttl) {
      return this.cache;
    }

    const response = await fetch(
      'https://project.supabase.co/functions/v1/get-catalog-navigation'
    );
    const result = await response.json();

    this.cache = result.data;
    this.timestamp = now;

    return this.cache;
  }

  invalidate() {
    this.cache = null;
    this.timestamp = 0;
  }
}

// Usage
const navCache = new NavigationCache();
const navigation = await navCache.getNavigation();
```

### Cache Invalidation

**When to invalidate:**
- After admin makes changes (for admin preview)
- On app deployment (clear stale data)
- On user refresh (if TTL expired)

**When NOT to invalidate:**
- Every page navigation
- Every component mount
- On route changes within app

---

## Testing Navigation Authority

### Test 1: Label Override
```bash
# 1. Admin sets custom label
UPDATE categories SET navigation_label = 'Custom Label' WHERE slug = 'test';

# 2. Fetch API
curl https://project.supabase.co/functions/v1/get-catalog-navigation

# 3. Verify response
# Expected: menu_label = 'Custom Label'
# Not: name or fallback value
```

### Test 2: Visibility Control
```bash
# 1. Admin hides category
UPDATE categories SET show_in_navigation = false WHERE slug = 'test';

# 2. Fetch API
curl https://project.supabase.co/functions/v1/get-catalog-navigation

# 3. Verify response
# Expected: Category not in navigation array
# Even if is_active = true
```

### Test 3: Order Authority
```bash
# 1. Admin sets specific order
UPDATE categories SET display_order = 10 WHERE slug = 'fashion';
UPDATE categories SET display_order = 5 WHERE slug = 'books';

# 2. Fetch API
curl https://project.supabase.co/functions/v1/get-catalog-navigation

# 3. Verify response
# Expected: Books (order 5) before Fashion (order 10)
```

### Test 4: Slug Override
```bash
# 1. Admin sets custom slug
UPDATE categories SET url_slug_override = 'custom-path' WHERE slug = 'test';

# 2. Fetch API
curl https://project.supabase.co/functions/v1/get-catalog-navigation

# 3. Verify response
# Expected: route_slug = 'custom-path'
# Not: slug = 'test'
```

---

## Common Pitfalls to Avoid

### Pitfall 1: Using Fallback Labels
```javascript
// ❌ WRONG
const label = category.menu_label || category.name || 'Category';

// ✅ CORRECT
const label = category.menu_label;
```

**Why:** Admin sets `menu_label` intentionally. Fallbacks bypass admin control.

### Pitfall 2: Hardcoded Navigation
```javascript
// ❌ WRONG
const categories = [
  { name: 'Fashion', url: '/fashion' },
  { name: 'Books', url: '/books' }
];

// ✅ CORRECT
const { data } = await fetch('/functions/v1/get-catalog-navigation');
const categories = data.navigation;
```

**Why:** Admin cannot control hardcoded navigation.

### Pitfall 3: Client-Side Filtering
```javascript
// ❌ WRONG
navigation.filter(item => item.is_active && item.show_in_navigation);

// ✅ CORRECT
// API already filtered - use as-is
```

**Why:** API enforces filtering. Client-side filtering is redundant and can cause issues.

### Pitfall 4: Slug Manipulation
```javascript
// ❌ WRONG
const url = `/category/${item.name.toLowerCase().replace(/\s+/g, '-')}`;

// ✅ CORRECT
const url = `/category/${item.route_slug}`;
```

**Why:** Admin-defined `route_slug` is authoritative.

---

## Deployment Checklist

### Admin Dashboard
- [x] Database schema has navigation fields
- [x] AdminNavigation component has full controls
- [x] useNavigationSettings hook implemented
- [x] RLS policies allow admin updates
- [x] Authority notice displayed prominently

### API
- [x] get-catalog-navigation returns menu_label
- [x] get-catalog-navigation returns route_slug
- [x] get-catalog-navigation returns menu_order
- [x] API sorts by display_order
- [x] API filters by show_in_navigation
- [x] API includes authority metadata

### Storefront (Integration Guide)
- [ ] Fetch navigation from API only
- [ ] Use menu_label for display
- [ ] Use route_slug for URLs
- [ ] Use menu_order for sorting
- [ ] No hardcoded labels
- [ ] No fallback logic
- [ ] Cache with 1-hour TTL
- [ ] Handle API errors gracefully

---

## Authority Statement

> This Admin Dashboard is the **AUTHORITATIVE PUBLISHER** of all storefront navigation. Admin-defined values for `menu_label`, `menu_order`, `show_in_navigation`, and `route_slug` are **NON-NEGOTIABLE** and must be respected exactly as returned by the API. Storefronts are **READ-ONLY CONSUMERS** and must never override, supplement, or fallback from these values.

**Status:** ✅ Fully Implemented and Enforced
**Version:** 1.0.0
**Last Updated:** February 3, 2026

---

## Quick Reference

| Field | Source | Purpose | Storefront Use |
|-------|--------|---------|----------------|
| `menu_label` | `navigation_label` or `name` | Navigation display text | Show in menus |
| `menu_order` | `display_order` | Sort order | Array order |
| `show_in_navigation` | `show_in_navigation` | Menu visibility | Include/exclude |
| `route_slug` | `url_slug_override` or `slug` | URL path | Link href |
| `is_featured` | `is_featured` | Homepage highlight | Featured section |
| `mega_menu_enabled` | `mega_menu_enabled` | Dropdown style | Menu rendering |

**Authority:** Admin Dashboard
**Consumer:** Storefront (read-only)
**API:** /functions/v1/get-catalog-navigation
