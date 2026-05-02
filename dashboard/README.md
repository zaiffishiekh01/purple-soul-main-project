# Vendor Dashboard - SSC Marketplace

Multi-vendor marketplace dashboard with authoritative catalog management and public API endpoints.

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production

```bash
# Build the application
npm run build

# Start the server with API endpoints
npm start
```

---

## 📡 Public API Endpoints

The dashboard exposes three public JSON API endpoints for storefront integration:

### Available Endpoints

| Endpoint | Description | Auth Required |
|----------|-------------|---------------|
| `GET /api/health` | Health check and server status | No |
| `GET /api/catalog/navigation` | Navigation menu structure | No |
| `GET /api/catalog/taxonomy` | Category hierarchy | No |
| `GET /api/catalog/facets` | Product filters/facets | No |

### Example Usage

```bash
# Health check
curl https://vendor.sufisciencecenter.info/api/health

# Fetch navigation
curl https://vendor.sufisciencecenter.info/api/catalog/navigation

# From JavaScript
fetch('https://vendor.sufisciencecenter.info/api/catalog/navigation')
  .then(r => r.json())
  .then(data => console.log(data));
```

### Production Verification

```bash
# Quick verification script
./verify-production.sh https://vendor.sufisciencecenter.info

# Manual health check
curl -i https://vendor.sufisciencecenter.info/api/health
```

Expected response:
```json
{"ok":true,"timestamp":"2026-02-03T12:34:56.789Z","uptime":12345,"environment":"production","version":"1.0.0"}
```

📖 **Verification Guide:** [PRODUCTION_VERIFICATION.md](./PRODUCTION_VERIFICATION.md)

### Features

✅ **Public Access** - No authentication required
✅ **CORS Enabled** - Cross-origin requests allowed
✅ **JSON Only** - Never returns HTML or redirects
✅ **Cached** - 1-hour cache headers for performance
✅ **Authoritative** - Admin-managed navigation structure

📖 **Full Documentation:** [PUBLIC_API_ENDPOINTS.md](./PUBLIC_API_ENDPOINTS.md)

---

## 🏗️ Architecture

### Frontend
- **React 19** with TypeScript
- **Next.js 15** (App Router) for build, SSR, and API routes
- **TailwindCSS** for styling
- **React Router** in client bundles where used for in-app navigation
- **Lucide React** for icons

### Backend
- **PostgreSQL** (local or hosted) via `DATABASE_URL`
- **Next.js Route Handlers** for `/api/*` (DB, auth, storage, named functions)
- **NextAuth** (cookie sessions) for dashboard sign-in
- **Row-level security** where defined in migrations under `postgres/migrations/`

### API Layer
- Next.js app routes under `app/api/`
- Public catalog endpoints at `/api/catalog/*`
- JSON-oriented handlers for integrations

---

## 📁 Project Structure

```
.
├── src/
│   ├── components/        # React components
│   │   ├── admin/        # Admin dashboard components
│   │   ├── vendor/       # Vendor portal components
│   │   └── modals/       # Modal dialogs
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── types/            # TypeScript types
│   └── constants/        # App constants
├── postgres/
│   └── migrations/       # SQL migrations (apply with npm run db:apply-migrations)
├── app/                  # Next.js App Router (API routes + pages)
├── docs/                 # Operational notes (see docs/OPERATIONS.md)
├── Dockerfile            # Next.js standalone production image
└── docker-compose.yml    # Example compose (env from .env)
```

---

## 🔑 Key Features

### Admin Dashboard
- **Navigation Management** - Authoritative navigation publisher
- **Category Management** - Hierarchical catalog taxonomy
- **Facet Management** - Product filters and attributes
- **Vendor Management** - Approve and manage vendors
- **Order Management** - Process orders and returns
- **Financial Management** - Payouts and commissions
- **Warehouse Management** - US fulfillment center support

### Vendor Portal
- **Product Management** - Add and manage products
- **Inventory Tracking** - Stock levels and alerts
- **Order Processing** - Fulfill customer orders
- **Shipping Labels** - Generate carrier labels
- **Financial Dashboard** - Earnings and payouts
- **Support Tickets** - Customer service integration

### Public APIs
- **Navigation API** - Menu structure for storefronts
- **Taxonomy API** - Complete category hierarchy
- **Facets API** - Product filtering options

---

## 🔧 Environment Variables

Create a `.env` file (see `.env.example`):

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dashboard
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

Apply schema: `npm run db:apply-migrations` (reads `postgres/migrations/*.sql`).

---

## 🚢 Deployment

### Quick deploy

```bash
npm run build
npm run start
```

### Docker Deploy

```bash
# Build image
docker build -t vendor-dashboard .

# Run container
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://your-host" \
  vendor-dashboard
```

### Docker Compose

```bash
# Start with docker-compose
docker-compose up -d
```

📖 **Full Deployment Guide:** [DEPLOYMENT_API_ENDPOINTS.md](./DEPLOYMENT_API_ENDPOINTS.md)

---

## 🧪 Testing

### Test API Endpoints

```bash
# Run automated tests
./test-api-endpoints.sh https://vendor.sufisciencecenter.info

# Manual test
curl -i https://vendor.sufisciencecenter.info/api/catalog/navigation
```

### Verification Checklist

- [ ] Endpoints return JSON (not HTML)
- [ ] CORS headers present
- [ ] No authentication required
- [ ] No redirects to UI routes
- [ ] Status codes correct (200, 404, 500)
- [ ] Error responses are JSON

---

## 📚 Documentation

### Operations (start here)

- [docs/OPERATIONS.md](./docs/OPERATIONS.md) — env vars, migrations, Docker, public API base URLs

### API Documentation
- [PUBLIC_API_ENDPOINTS.md](./PUBLIC_API_ENDPOINTS.md) - Complete API guide
- [DEPLOYMENT_API_ENDPOINTS.md](./DEPLOYMENT_API_ENDPOINTS.md) - Deployment instructions
- [CATALOG_API_DOCUMENTATION.md](./CATALOG_API_DOCUMENTATION.md) - Catalog API reference
- [CATALOG_API_QUICK_START.md](./CATALOG_API_QUICK_START.md) - 5-minute integration

### Navigation System
- [NAVIGATION_AUTHORITY.md](./NAVIGATION_AUTHORITY.md) - Navigation authority model
- [NAVIGATION_IMPLEMENTATION_COMPLETE.md](./NAVIGATION_IMPLEMENTATION_COMPLETE.md) - Implementation details
- [CATALOG_GOVERNANCE_AUTHORITY.md](./CATALOG_GOVERNANCE_AUTHORITY.md) - Catalog governance

### System Guides
- [CATEGORY_SYSTEM_GUIDE.md](./CATEGORY_SYSTEM_GUIDE.md) - Category management
- [FACET_FILTER_SYSTEM.md](./FACET_FILTER_SYSTEM.md) - Facet filters
- [COMPLETE_WORKFLOWS_GUIDE.md](./COMPLETE_WORKFLOWS_GUIDE.md) - End-to-end workflows
- [PAYOUT_WORKFLOW_GUIDE.md](./PAYOUT_WORKFLOW_GUIDE.md) - Payment processing

---

## 🔐 Security

- **RLS Policies** - Row-level security on all tables
- **Session authentication** - NextAuth (cookie-based)
- **CORS Protection** - Configured for API endpoints
- **Environment Variables** - Secrets never in code
- **Input Validation** - All user input validated
- **Rate Limiting** - API endpoint protection (recommended)

---

## 📊 Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React, TypeScript, TailwindCSS |
| Build / runtime | Next.js 15 |
| Backend | PostgreSQL (`DATABASE_URL`, `pg`) |
| API | Next.js Route Handlers under `app/api/` |
| Deployment | Docker, Node.js, Vercel, Render |
| Icons | Lucide React |
| Routing | Next.js App Router + client areas using React Router where present |

---

## 🤝 Contributing

1. Follow existing code style
2. Test all changes locally
3. Update documentation
4. Verify API endpoints still work
5. Run build: `npm run build`

---

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run smoke:api    # Optional: curl public /api/* smoke checks

# Production server (after build)
npm run start        # next start

# Quality
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript
```

---

## 🐛 Troubleshooting

### API Returns HTML Instead of JSON

**Solution:** Confirm you are hitting Next.js (`npm run start`), not a static file host only. API routes live under `app/api/`.

### CORS Errors

**Solution:** Adjust CORS in the relevant `app/api/**/route.ts` handlers or your reverse proxy.

### 404 on API Endpoints

**Solution:** Check that `next start` is running and that `/api/catalog/*` routes exist under `app/api/catalog/`.

### Build Errors

**Solution:**
```bash
rm -rf node_modules .next
npm install
npm run build
```

---

## 📞 Support

- **Documentation:** See `/docs` folder
- **API Issues:** Check [PUBLIC_API_ENDPOINTS.md](./PUBLIC_API_ENDPOINTS.md)
- **Deployment:** See [DEPLOYMENT_API_ENDPOINTS.md](./DEPLOYMENT_API_ENDPOINTS.md)

---

## ✅ Status

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** February 3, 2026

### Recent Updates
- ✅ Public API endpoints implemented
- ✅ Navigation authority system complete
- ✅ Express server with CORS support
- ✅ Docker deployment configured
- ✅ Comprehensive documentation

---

## 📖 Quick Links

- [Test API Endpoints](./test-api-endpoints.sh)
- [Public API Documentation](./PUBLIC_API_ENDPOINTS.md)
- [Deployment Guide](./DEPLOYMENT_API_ENDPOINTS.md)
- [Navigation Authority](./NAVIGATION_AUTHORITY.md)

---

**Built with ❤️ for Sufi Science Center Marketplace**
