# Purple Soul Collective — E-Commerce Platform

A Next.js 13 (App Router) e-commerce platform for handmade spiritual goods with vendor onboarding, admin dashboard, and customer account management.

---

## Project Structure

```
app/                        # Next.js App Router pages
  layout.tsx                # Root layout — fonts, providers, header, footer
  page.tsx                  # Homepage
  globals.css               # Global styles and Tailwind base

  p/[id]/                   # Product detail pages (dynamic)
  c/[category]/             # Category browse pages (dynamic)
  c/[category]/[subcategory]/  # Subcategory pages (dynamic)
  collections/[slug]/       # Collection pages (dynamic)

  cart/                     # Cart page
  checkout/                 # Multi-step checkout (customer → address → delivery → payment → review)
  order/[orderId]/          # Order status page
  order/confirmation/[orderId]/  # Post-purchase confirmation

  account/                  # Customer account area (auth-guarded)
    orders/, wishlist/, profile/, payments/, addresses/, ...

  vendor/                   # Vendor dashboard (auth-guarded, vendor role)
    onboarding/             # Vendor application wizard (auth built-in, no redirect)
    products/, orders/, inventory/, analytics/, settings/

  admin/                    # Admin dashboard (auth-guarded, admin role)
    products/, orders/, vendors/, categories/, analytics/, ...

  api/                      # Next.js API Routes (server-side handlers)
    auth/                   # Login, logout, register, refresh, me
    cart/, wishlist/, search/, stats/, messages/, promotions/
    vendor/                 # Vendor-scoped data endpoints
    admin/                  # Admin-scoped data endpoints

components/
  layout/                   # Header, Footer, MainNav, MobileNav, DynamicHero
  auth/                     # AuthModal, AuthGuard, PasswordStrength, TwoFactorSetup
  products/                 # ProductCard, ProductGrid, ReviewList, StarRating, etc.
  checkout/                 # CouponInput, Stepper
  vendor/                   # OnboardingWizard, ProductEditor, RequestContactModal
  orders/                   # OrderTimeline
  search/                   # SearchFilters, PopularSearches
  stats/                    # DynamicStats
  ui/                       # shadcn/ui base components (do not edit directly)
  providers.tsx             # Client-side context providers (see Provider Hierarchy)

lib/
  supabase/client.ts        # Supabase browser client singleton
  auth/                     # JWT, session, RBAC, audit, middleware, API auth context
  api/                      # API client helpers (admin, vendor, external-catalog)
  cart/utils.ts             # Cart calculation helpers
  cart-context.tsx          # Cart state context
  checkout/context.tsx      # Multi-step checkout state
  wishlist/context.tsx      # Wishlist state context
  data/                     # Data layer: supabase.ts (live), mock.ts (dev), index.ts (router)
  utils.ts                  # cn() and general utilities
  badge-utils.ts            # Product badge helpers

types/
  index.ts                  # Shared TypeScript types (Product, Order, Vendor, etc.)
  account.ts                # Account-specific types
  vendor-dashboard-contract.ts  # Vendor dashboard API contract types

supabase/migrations/        # All database migrations (apply via Supabase MCP tool)
```

---

## Route Map

| URL Pattern | Page | Auth Required |
|---|---|---|
| `/` | Homepage with hero and featured products | No |
| `/p/[id]` | Product detail | No |
| `/c/[category]` | Category browse | No |
| `/c/[category]/[subcategory]` | Subcategory browse | No |
| `/collections/[slug]` | Collection | No |
| `/search` | Search results | No |
| `/cart` | Shopping cart | No |
| `/checkout/*` | Checkout steps | No (guest allowed) |
| `/order/[orderId]` | Order status | No |
| `/order/confirmation/[orderId]` | Order confirmation | No |
| `/account/*` | Customer account | Yes (customer) |
| `/vendor/*` | Vendor dashboard | Yes (vendor role) |
| `/vendor/onboarding` | Vendor application | Inline sign-up — no pre-auth required |
| `/admin/*` | Admin dashboard | Yes (admin role) |
| `/portal` | Auth portal redirect | No |
| `/become-vendor` | Vendor info page | No |
| `/about`, `/contact`, `/returns`, ... | Static info pages | No |

---

## Provider Hierarchy

```
RootLayout (server)
  └── Providers (client — components/providers.tsx, used in app/layout.tsx)
        ├── APIAuthProvider      (lib/auth/api-context.tsx)
        │     Manages JWT-based auth state, user object, signIn/signOut
        ├── WishlistProvider     (lib/wishlist/context.tsx)
        │     Manages wishlist items, synced with Supabase when authenticated
        ├── CartProvider         (lib/cart-context.tsx)
        │     Cart items with localStorage persistence + server sync
        └── CheckoutProvider    (lib/checkout/context.tsx)
              Multi-step checkout state (steps, addresses, shipping selection)
```

All providers are necessarily client-side. They use React state, localStorage, and Supabase subscriptions.

---

## Editable vs Protected Files

### Safe to Edit (Business Logic and UI)
- `app/**/*.tsx` — pages and layouts
- `components/layout/` — header, footer, navigation
- `components/products/` — product display components
- `components/auth/` — auth modals and guards
- `components/vendor/` — vendor-specific UI
- `lib/data/` — data fetching layer
- `lib/api/` — API client helpers
- `app/api/` — server-side API routes
- `supabase/migrations/` — always ADD new migrations, never edit existing ones

### Edit with Caution
- `lib/auth/` — auth middleware and session logic (touches security)
- `components/providers.tsx` — changing provider order can break context consumers
- `lib/cart-context.tsx`, `lib/checkout/context.tsx` — breaks checkout flow if mishandled
- `app/layout.tsx` — root layout; metadata and font changes are safe, provider changes are not

### Do Not Edit Directly
- `components/ui/` — shadcn/ui base components; extend via composition, not direct edits
- `supabase/migrations/*.sql` — never modify applied migrations; always create new ones
- `package.json` `dependencies` — check existing libraries before adding new ones

---

## Naming Conventions

### Files
- Pages: `page.tsx` (required by Next.js App Router)
- Layouts: `layout.tsx`
- Loading states: `loading.tsx`
- Error boundaries: `error.tsx`
- Components: `kebab-case.tsx` (e.g., `product-card.tsx`)
- Utilities/hooks: `kebab-case.ts`

### Components
- Always named exports using PascalCase: `export function ProductCard()`
- Default exports only for Next.js pages and layouts
- Never anonymous arrow function components at the module level

### Types
- Interfaces use PascalCase: `interface ProductCardProps`
- Type aliases use PascalCase: `type CartItem`
- Keep shared types in `types/index.ts`; page-specific types can co-locate

---

## Component Rules

1. **Server vs Client**: Default to server components. Add `'use client'` only when the component uses `useState`, `useEffect`, browser APIs, event handlers, or context consumers.

2. **No bare `<a>` for internal links**: Always use `<Link href="...">` from `next/link` for in-app navigation. Use `<a>` only for external URLs (`http://...`) and `mailto:` links.

3. **Lazy load heavy modules**: Large client-only libraries (recharts, framer-motion editors, maps) must be loaded with `dynamic(() => import(...), { ssr: false })`. Add a loading skeleton as the fallback.

4. **Providers stay low**: Don't wrap pages in new providers unless the state is scoped to those pages. Page-scoped state belongs in the page component or a local context file.

5. **Loading states**: Every dynamic route (`[param]`) must have a `loading.tsx` sibling for Suspense-based streaming.

6. **No mixed exports**: Component files export components only. Helpers, constants, and types belong in separate files under `lib/` or `types/`.

---

## Performance Rules

1. **Images**: Use `next/image` for all product images. Always set `width`, `height`, or `fill` + `sizes`. Never use raw `<img>` for above-the-fold content.

2. **Fonts**: Loaded via `next/font` in `app/layout.tsx`. Do not import fonts via CSS `@import`.

3. **Third-party scripts**: Load with `next/script` using `strategy="lazyOnload"` unless critical.

4. **Bundle size**: Before adding a new npm package, check if the functionality already exists in the codebase or in a package already installed. Prefer tree-shakeable packages.

5. **Dynamic imports**: Components only used in modals, drawers, or tabs should be dynamically imported. This includes: cart drawer, auth modal when not on auth pages, review forms, and admin chart widgets.

6. **API calls**: Use server components to fetch data where possible. Client-side fetches go in `useEffect` with proper loading/error states. Never fetch in render without memoization.

7. **Static generation**: Product, category, and collection pages are candidates for `generateStaticParams`. Implement for high-traffic stable routes when product catalog is finalized.

---

## Database

All persistence uses Supabase (PostgreSQL).

- **Client**: `lib/supabase/client.ts` — browser singleton
- **Migrations**: `supabase/migrations/` — applied in timestamp order
- **RLS**: Every table has Row Level Security enabled. Never disable RLS. Never use `USING (true)`.
- **New tables**: Always create via a new migration file using the `mcp__supabase__apply_migration` tool.

---

## Development Notes

- Node version: 18+
- Framework: Next.js 13.5 (App Router)
- Styling: Tailwind CSS 3.3 + shadcn/ui
- Auth: Supabase Auth (`@supabase/supabase-js`)
- Forms: react-hook-form + zod
- Icons: lucide-react (do not install other icon libraries)
- Animations: framer-motion (already installed, use sparingly)
- Charts: recharts (already installed, always lazy load via `dynamic`)
