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
- **React 18** with TypeScript
- **Vite** for fast builds
- **TailwindCSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Supabase** for database and auth
- **Edge Functions** for serverless API
- **Express** for API proxy layer
- **PostgreSQL** with RLS policies

### API Layer
- **Express.js** server proxies to Supabase Edge Functions
- Public endpoints at `/api/catalog/*`
- Full CORS support
- JSON-only responses

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
├── supabase/
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migrations
├── dist/                 # Built application
├── server.cjs           # Express API server
└── Dockerfile           # Container configuration
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

Create a `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Server Configuration (optional)
PORT=3000
NODE_ENV=production
```

---

## 🚢 Deployment

### Quick Deploy

```bash
# Build and start
npm run server
```

### Docker Deploy

```bash
# Build image
docker build -t vendor-dashboard .

# Run container
docker run -d -p 3000:3000 \
  -e VITE_SUPABASE_URL="https://your-project.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="your-key" \
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
- **JWT Authentication** - Supabase Auth integration
- **CORS Protection** - Configured for API endpoints
- **Environment Variables** - Secrets never in code
- **Input Validation** - All user input validated
- **Rate Limiting** - API endpoint protection (recommended)

---

## 📊 Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React, TypeScript, TailwindCSS |
| Build Tool | Vite |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| API | Express.js, Edge Functions |
| Deployment | Docker, Node.js, Vercel, Render |
| Icons | Lucide React |
| Routing | React Router v7 |

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
npm run preview      # Preview production build

# Server
npm start            # Start Express server
npm run server       # Build + Start

# Quality
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript
```

---

## 🐛 Troubleshooting

### API Returns HTML Instead of JSON

**Solution:** Ensure API routes in `server.cjs` are defined BEFORE static file serving.

### CORS Errors

**Solution:** Verify `cors` middleware is configured with `origin: '*'`.

### 404 on API Endpoints

**Solution:** Check that `server.cjs` is running and handling `/api/catalog/*` routes.

### Build Errors

**Solution:**
```bash
rm -rf node_modules dist
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
