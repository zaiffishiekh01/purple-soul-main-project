# Public API Endpoints - Implementation Guide

## Overview

The dashboard exposes three public JSON catalog endpoints implemented as **Next.js Route Handlers** under `app/api/catalog/*`. They read from **Postgres** via `DATABASE_URL` (no Supabase Edge, no `@supabase/supabase-js`). Responses are JSON with CORS where configured in code.

---

## 🎯 Implemented Endpoints

### 1. Navigation API
**Endpoint:** `GET /api/catalog/navigation`

Returns the authoritative navigation structure for storefronts.

**Response:**
```json
{
  "success": true,
  "data": {
    "navigation": [
      {
        "id": "uuid",
        "name": "Fashion",
        "menu_label": "Shop Fashion",
        "route_slug": "modest-fashion",
        "icon": "👗",
        "menu_order": 1,
        "show_in_navigation": true,
        "children": []
      }
    ],
    "featured": [],
    "static_links": []
  },
  "meta": {
    "authority": "Admin Dashboard is the SINGLE SOURCE OF TRUTH"
  }
}
```

### 2. Taxonomy API
**Endpoint:** `GET /api/catalog/taxonomy`

Returns the complete category taxonomy (hierarchical structure).

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [],
    "hierarchy": []
  }
}
```

### 3. Facets API
**Endpoint:** `GET /api/catalog/facets`

Returns available facets and filters for product search.

**Response:**
```json
{
  "success": true,
  "data": {
    "facets": [],
    "facet_groups": []
  }
}
```

---

## 🔧 Technical Implementation

### Architecture

```
Client Request
     ↓
GET /api/catalog/navigation  (or taxonomy / facets)
     ↓
Next.js Route Handler  (app/api/catalog/*/route.ts)
     ↓
Server-side Postgres (pg) + application logic
     ↓
JSON response (CORS / cache per handler)
```

### Server configuration

**Implementation:** `app/api/catalog/navigation/route.ts`, `taxonomy/route.ts`, `facets/route.ts`.

Key points:
- Public GET handlers for storefront consumption (unless you add auth in code).
- JSON responses from Next.js; no separate Express proxy.
- Cache headers depend on each route’s implementation.
- Full-stack app: use `npm run dev` / `npm run build` + `npm run start` (or Docker — see `Dockerfile`).

### CORS Headers

All API endpoints include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Cache Strategy

API responses include:
```
Cache-Control: public, max-age=3600
```

Clients can cache responses for 1 hour to reduce server load.

---

## 🚀 Deployment

### Local Development

1. **Build the Next.js app:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm run start
   ```

3. **Access endpoints:**
   ```
   http://localhost:3000/api/catalog/navigation
   http://localhost:3000/api/catalog/taxonomy
   http://localhost:3000/api/catalog/facets
   ```

### Production Deployment

#### Option 1: Node (recommended)

1. Set `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` on the host (see `.env.example`).
2. `npm ci && npm run build && npm run start`, or use **PM2**: `pm2 start npm --name vendor-dashboard -- start`.

#### Option 2: Docker

From the `dashboard` directory: `docker build -t vendor-dashboard .` then run with `--env-file .env` (see `docker-compose.yml`).

#### Option 3: Vercel / similar

Connect the repo as a **Next.js** project; framework defaults deploy `app/api/*` without a custom `vercel.json` Edge proxy.

##### Render

Create `render.yaml`:
```yaml
services:
  - type: web
    name: vendor-dashboard
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_VERSION
        value: 22
      - key: NEXTAUTH_URL
        sync: false
      - key: AUTH_SECRET
        sync: false
```

---

## ✅ Verification Checklist

### 1. Public Access (No Authentication)

```bash
# Test in incognito/private browsing
curl -i https://vendor.sufisciencecenter.info/api/catalog/navigation

# Expected:
# - Status: 200 OK
# - Content-Type: application/json
# - Body: Valid JSON response
# - No redirect (30x status)
# - No HTML in response
```

### 2. CORS Headers Present

```bash
curl -i -H "Origin: https://storefront.example.com" \
  https://vendor.sufisciencecenter.info/api/catalog/navigation

# Expected headers:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization
```

### 3. OPTIONS Preflight Support

```bash
curl -i -X OPTIONS \
  -H "Origin: https://storefront.example.com" \
  -H "Access-Control-Request-Method: GET" \
  https://vendor.sufisciencecenter.info/api/catalog/navigation

# Expected:
# - Status: 200 OK
# - CORS headers present
```

### 4. JSON Response (Never HTML)

```bash
# Test with invalid endpoint
curl -i https://vendor.sufisciencecenter.info/api/catalog/invalid

# Expected:
# - Status: 404
# - Content-Type: application/json
# - Body: { "success": false, "error": "API endpoint not found" }
# - NOT: HTML page or redirect to /
```

### 5. Error Responses are JSON

```bash
# If Supabase is unreachable
curl -i https://vendor.sufisciencecenter.info/api/catalog/navigation

# Expected on error:
# - Status: 500
# - Content-Type: application/json
# - Body: { "success": false, "error": "...", "message": "..." }
```

---

## 🧪 Testing Guide

### Manual Testing

#### Test 1: Basic Functionality
```bash
curl https://vendor.sufisciencecenter.info/api/catalog/navigation
```

**Expected:**
- Valid JSON response
- Contains `navigation`, `featured`, `static_links`
- Status 200

#### Test 2: CORS from Browser
```javascript
// Open browser console on any domain
fetch('https://vendor.sufisciencecenter.info/api/catalog/navigation')
  .then(r => r.json())
  .then(data => console.log(data));
```

**Expected:**
- No CORS error
- Data logged to console

#### Test 3: Invalid Endpoint
```bash
curl https://vendor.sufisciencecenter.info/api/catalog/invalid
```

**Expected:**
- Status 404
- JSON response with error message
- NOT HTML or redirect

#### Test 4: All Three Endpoints
```bash
# Navigation
curl https://vendor.sufisciencecenter.info/api/catalog/navigation

# Taxonomy
curl https://vendor.sufisciencecenter.info/api/catalog/taxonomy

# Facets
curl https://vendor.sufisciencecenter.info/api/catalog/facets
```

**Expected:**
- All return 200 OK
- All return valid JSON
- All have CORS headers

### Automated Testing

Create `test-api.sh`:
```bash
#!/bin/bash

BASE_URL="https://vendor.sufisciencecenter.info"
ENDPOINTS=(
  "/api/catalog/navigation"
  "/api/catalog/taxonomy"
  "/api/catalog/facets"
)

echo "Testing Public API Endpoints..."
echo "================================"

for endpoint in "${ENDPOINTS[@]}"; do
  echo ""
  echo "Testing: $endpoint"
  echo "---"

  # Test GET request
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n 1)

  echo "Status: $status"

  # Check if response is JSON
  if echo "$body" | jq . > /dev/null 2>&1; then
    echo "✓ Valid JSON"
  else
    echo "✗ Invalid JSON"
  fi

  # Check CORS headers
  headers=$(curl -s -I "$BASE_URL$endpoint")
  if echo "$headers" | grep -i "access-control-allow-origin" > /dev/null; then
    echo "✓ CORS headers present"
  else
    echo "✗ CORS headers missing"
  fi

  # Check status code
  if [ "$status" -eq 200 ]; then
    echo "✓ Status 200 OK"
  else
    echo "✗ Status not 200"
  fi
done

echo ""
echo "================================"
echo "Testing complete!"
```

Run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 🔍 Troubleshooting

### Issue 1: Endpoints Return 404 HTML

**Symptom:** `/api/catalog/navigation` returns React app HTML instead of JSON

**Cause:** React Router is catching the route before the server

**Solution:**
- Ensure `Next.js` handles `/api/*` routes BEFORE the static file middleware
- Check that `app.get('/api/catalog/*')` comes before `app.use(express.static())`

### Issue 2: CORS Error in Browser

**Symptom:** Browser console shows CORS error

**Cause:** CORS headers not being sent

**Solution:**
- Verify `cors` middleware is configured: `app.use(cors({ origin: '*' }))`
- Check headers in response: `curl -I https://your-domain.com/api/catalog/navigation`
- Ensure OPTIONS requests are handled

### Issue 3: 401/403 Error

**Symptom:** API returns authentication error

**Cause:** Route handler or middleware now requires a session for that path.

**Solution:**
- Confirm `app/api/catalog/*` handlers are intended to be public.
- For signed-in flows, use NextAuth session cookies, not a Supabase anon JWT.

### Issue 4: 500 Internal Server Error

**Symptom:** API returns 500 status

**Cause:** Database error, missing env, or unhandled exception in the Route Handler.

**Solution:**
- Check server logs: `npm run start`
- Verify `DATABASE_URL` and that migrations have been applied (`npm run db:apply-migrations`).
- Smoke-test: `curl https://<host>/api/health` then `curl https://<host>/api/catalog/navigation`

### Issue 5: Redirect to / Instead of JSON

**Symptom:** `/api/catalog/navigation` redirects to homepage

**Cause:** Server configuration or middleware order

**Solution:**
- API routes must be defined BEFORE the catch-all route
- Check route order in `Next.js`
- Ensure no authentication middleware on `/api/catalog/*` routes

---

## 📊 Monitoring & Performance

### Response Time Benchmarks

Expected response times:
- Navigation: < 500ms
- Taxonomy: < 500ms
- Facets: < 300ms

### Monitoring Commands

```bash
# Test response time
time curl -s https://vendor.sufisciencecenter.info/api/catalog/navigation > /dev/null

# Test with verbose output
curl -w "\nTime: %{time_total}s\nStatus: %{http_code}\n" \
  https://vendor.sufisciencecenter.info/api/catalog/navigation

# Load testing (requires 'ab' - Apache Bench)
ab -n 1000 -c 10 https://vendor.sufisciencecenter.info/api/catalog/navigation
```

### Logging

Server logs include:
- Requests to API endpoints
- Errors from Route Handlers / Postgres
- Response status codes

View logs:
```bash
# If using PM2
pm2 logs vendor-dashboard

# If using systemd
journalctl -u vendor-dashboard -f

# Direct node
npm run start 2>&1 | tee server.log
```

---

## 🔐 Security Considerations

### ✅ Implemented

- CORS allows all origins (appropriate for public API)
- No sensitive data in responses
- Public read-only access
- Rate limiting at the edge or reverse proxy (recommended)
- RLS policies in Postgres (where defined in migrations) enforce data access

### 🚧 Recommended Additions

1. **Rate Limiting:**
   ```javascript
   const rateLimit = require('express-rate-limit');

   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });

   app.use('/api/', apiLimiter);
   ```

2. **Request Logging:**
   ```javascript
   const morgan = require('morgan');
   app.use(morgan('combined'));
   ```

3. **Helmet Security Headers:**
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

---

## 📝 Environment Variables

Required in `.env`:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXTAUTH_URL=https://your-dashboard.example.com
AUTH_SECRET=openssl-rand-base64-32

# Optional
PORT=3000
```

---

## 🎯 Success Criteria

All of the following must pass:

- [x] `/api/catalog/navigation` returns JSON (not HTML)
- [x] `/api/catalog/taxonomy` returns JSON (not HTML)
- [x] `/api/catalog/facets` returns JSON (not HTML)
- [x] All endpoints accessible without authentication
- [x] All endpoints have CORS headers
- [x] Error responses are JSON (not HTML)
- [x] No redirects to UI routes (/)
- [x] Proper HTTP status codes (200, 404, 500)
- [x] Content-Type: application/json header
- [x] Can be called from browser (no CORS errors)
- [x] Can be called via curl (works in incognito)
- [x] OPTIONS preflight requests handled

---

## 🚀 Quick Start for Developers

### Local Testing

```bash
# 1. Install dependencies
npm install

# 2. Set up .env file
cp .env.example .env
# Edit .env (DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL)

# 3. Build the app
npm run build

# 4. Start the server
npm run start

# 5. Test the endpoint
curl http://localhost:3000/api/catalog/navigation
```

### Integration Example

```javascript
// Fetch navigation in your storefront
async function fetchNavigation() {
  try {
    const response = await fetch(
      'https://vendor.sufisciencecenter.info/api/catalog/navigation'
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (error) {
    console.error('Failed to fetch navigation:', error);
    return null;
  }
}

// Usage
const { navigation, featured } = await fetchNavigation();
```

---

## 📚 Related Documentation

- [NAVIGATION_AUTHORITY.md](./NAVIGATION_AUTHORITY.md) - Navigation system authority
- [CATALOG_API_DOCUMENTATION.md](./CATALOG_API_DOCUMENTATION.md) - Complete API docs
- [CATALOG_API_QUICK_START.md](./CATALOG_API_QUICK_START.md) - 5-minute integration guide

---

## ✅ Implementation Status

**Status:** ✅ **COMPLETE**

**Components:**
- ✅ Next.js (`app/api/**`)
- ✅ CORS / headers per route
- ✅ API route handlers
- ✅ Error handling
- ✅ JSON responses
- ✅ Cache headers
- ✅ Package.json scripts

**Deployment:**
- ✅ Local development ready
- ✅ Production configuration provided
- ✅ Platform configs documented

**Testing:**
- ✅ Verification checklist provided
- ✅ Test scripts included
- ✅ Troubleshooting guide complete

**Version:** 1.0.0
**Last Updated:** February 3, 2026
**Status:** Production Ready

---

**All API endpoints are now public, accessible without authentication, and return JSON with proper CORS headers. No redirects to UI routes occur.**
