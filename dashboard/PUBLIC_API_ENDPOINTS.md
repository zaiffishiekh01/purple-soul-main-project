# Public API Endpoints - Implementation Guide

## Overview

The dashboard now exposes three public JSON API endpoints that proxy to Supabase Edge Functions. These endpoints are accessible without authentication and return JSON responses with proper CORS headers.

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
GET /api/catalog/navigation
     ↓
Express Server (server.cjs)
     ↓
Proxies to Supabase Edge Function
     ↓
GET {SUPABASE_URL}/functions/v1/get-catalog-navigation
     ↓
Returns JSON with CORS headers
     ↓
Client receives response
```

### Server Configuration

**File:** `server.cjs`

Key features:
- ✅ CORS enabled for all origins
- ✅ JSON responses only (never HTML redirects)
- ✅ Proper error handling with JSON responses
- ✅ Public access (no authentication required)
- ✅ 1-hour cache headers
- ✅ Serves React SPA for non-API routes

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

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access endpoints:**
   ```
   http://localhost:3000/api/catalog/navigation
   http://localhost:3000/api/catalog/taxonomy
   http://localhost:3000/api/catalog/facets
   ```

### Production Deployment

#### Option 1: Node.js Server (Recommended)

1. **Deploy the built app with server.cjs**
   - Upload `dist/` folder
   - Upload `server.cjs`
   - Upload `.env` file with Supabase credentials

2. **Install dependencies:**
   ```bash
   npm install express cors dotenv
   ```

3. **Start the server:**
   ```bash
   node server.cjs
   ```

4. **Use a process manager:**
   ```bash
   # Using PM2
   pm2 start server.cjs --name "vendor-dashboard"

   # Using systemd (create a service file)
   sudo systemctl start vendor-dashboard
   ```

#### Option 2: Platform-Specific Configuration

##### Vercel

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.cjs",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/catalog/(.*)",
      "dest": "/server.cjs"
    },
    {
      "src": "/(.*)",
      "dest": "/server.cjs"
    }
  ]
}
```

##### Netlify

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/catalog/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Then create Netlify functions in `netlify/functions/`.

##### Render

Create `render.yaml`:
```yaml
services:
  - type: web
    name: vendor-dashboard
    env: node
    buildCommand: npm install && npm run build
    startCommand: node server.cjs
    envVars:
      - key: NODE_VERSION
        value: 22
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
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
- Ensure `server.cjs` handles `/api/*` routes BEFORE the static file middleware
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

**Cause:** Supabase function requires authentication

**Solution:**
- Edge functions should have `verify_jwt: false` for public access
- Check `.env` has correct `VITE_SUPABASE_ANON_KEY`
- Verify Supabase RLS policies allow public SELECT

### Issue 4: 500 Internal Server Error

**Symptom:** API returns 500 status

**Cause:** Supabase connection error or edge function error

**Solution:**
- Check server logs: `node server.cjs`
- Verify Supabase URL and key in `.env`
- Test edge function directly: `curl {SUPABASE_URL}/functions/v1/get-catalog-navigation`
- Check Supabase dashboard for function logs

### Issue 5: Redirect to / Instead of JSON

**Symptom:** `/api/catalog/navigation` redirects to homepage

**Cause:** Server configuration or middleware order

**Solution:**
- API routes must be defined BEFORE the catch-all route
- Check route order in `server.cjs`
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
- Errors from Supabase functions
- Response status codes

View logs:
```bash
# If using PM2
pm2 logs vendor-dashboard

# If using systemd
journalctl -u vendor-dashboard -f

# Direct node
node server.cjs 2>&1 | tee server.log
```

---

## 🔐 Security Considerations

### ✅ Implemented

- CORS allows all origins (appropriate for public API)
- No sensitive data in responses
- Public read-only access
- Rate limiting by Supabase
- RLS policies enforce data access

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
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Server Configuration (optional)
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
# Edit .env with your Supabase credentials

# 3. Build the app
npm run build

# 4. Start the server
npm start

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
- ✅ Express server (`server.cjs`)
- ✅ CORS middleware
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
