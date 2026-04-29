# Production Verification Guide

## ✅ Immediate Verification Steps

Run these commands to verify your production API endpoints are working correctly.

---

## 1. Health Check (Required First Step)

```bash
curl -i https://vendor.sufisciencecenter.info/api/health
```

**Expected Response:**
```
HTTP/2 200 OK
content-type: application/json
access-control-allow-origin: *

{"ok":true,"timestamp":"2026-02-03T12:34:56.789Z","uptime":12345,"environment":"production","version":"1.0.0"}
```

**Status Indicators:**
- ✅ **Status 200** - Server is running
- ✅ **Content-Type: application/json** - API layer is working
- ✅ **CORS headers present** - Cross-origin requests enabled
- ❌ **Status 404** - Server not routing `/api/*` correctly
- ❌ **HTML response** - Static hosting serving SPA instead of API

---

## 2. Navigation Endpoint

```bash
curl -i https://vendor.sufisciencecenter.info/api/catalog/navigation
```

**Expected:**
- Status: 200 OK
- Content-Type: application/json
- Body contains: `{"success":true,"data":{...}}`
- CORS headers present
- NO redirect (30x status)
- NO HTML in response body

**What to Check:**
```bash
# Check status code only
curl -s -o /dev/null -w "%{http_code}" https://vendor.sufisciencecenter.info/api/catalog/navigation

# Expected: 200

# Check content type
curl -s -I https://vendor.sufisciencecenter.info/api/catalog/navigation | grep -i content-type

# Expected: content-type: application/json

# Verify JSON structure
curl -s https://vendor.sufisciencecenter.info/api/catalog/navigation | jq .success

# Expected: true
```

---

## 3. Taxonomy Endpoint

```bash
curl -i https://vendor.sufisciencecenter.info/api/catalog/taxonomy
```

**Expected:**
- Status: 200 OK
- Content-Type: application/json
- Valid JSON response

---

## 4. Facets Endpoint

```bash
curl -i https://vendor.sufisciencecenter.info/api/catalog/facets
```

**Expected:**
- Status: 200 OK
- Content-Type: application/json
- Valid JSON response

---

## 5. CORS Verification (Browser Test)

Open browser console on **any domain** and run:

```javascript
fetch('https://vendor.sufisciencecenter.info/api/health')
  .then(r => r.json())
  .then(d => console.log('✓ Health check passed:', d))
  .catch(e => console.error('✗ Failed:', e));

fetch('https://vendor.sufisciencecenter.info/api/catalog/navigation')
  .then(r => r.json())
  .then(d => console.log('✓ Navigation loaded:', d))
  .catch(e => console.error('✗ Failed:', e));
```

**Expected:**
- No CORS errors in console
- Data logged successfully
- If CORS error appears, server is not sending proper headers

---

## 6. Automated Test Suite

```bash
./test-api-endpoints.sh https://vendor.sufisciencecenter.info
```

**Expected Output:**
```
==========================================
  Testing Public API Endpoints
==========================================
Base URL: https://vendor.sufisciencecenter.info

----------------------------------------
Testing: /api/health
----------------------------------------
1. HTTP Status Check... ✓ PASS (Status: 200)
2. Content-Type Check... ✓ PASS (Content-Type: application/json)
3. Valid JSON Check... ✓ PASS
4. CORS Headers Check... ✓ PASS
5. No Redirect Check... ✓ PASS (No redirects)

[... similar output for other endpoints ...]

==========================================
  Test Summary
==========================================
Total Tests:  24
Passed:       24
Failed:       0

✓ All tests passed!
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Health Check Returns 404

**Symptom:**
```bash
curl -i https://vendor.sufisciencecenter.info/api/health
# Returns: 404 Not Found
```

**Diagnosis:** API routes not configured or server not running

**Solutions:**

#### A. Check if server is running
```bash
# If using PM2
pm2 status

# If using systemd
systemctl status vendor-dashboard

# If using Docker
docker ps | grep vendor-dashboard
```

#### B. Verify deployment type

**Static Hosting (Vercel, Netlify, GitHub Pages):**
- These platforms serve static files only
- `/api/*` routes return the SPA's `index.html`
- **Solution:** Migrate to Node.js runtime (see below)

**Node.js Hosting (Render, Railway, Fly, VPS):**
- Should work out of the box
- Verify `server.cjs` is the start command
- Check logs for errors

---

### Issue 2: Returns HTML Instead of JSON

**Symptom:**
```bash
curl https://vendor.sufisciencecenter.info/api/health
# Returns: <!DOCTYPE html>...
```

**Diagnosis:** Static hosting is serving the SPA for all routes

**Root Cause:** You're currently on static hosting (Vercel, Netlify, etc.) which can't run Node.js servers.

**Solutions:**

#### Option A: Migrate to Node.js Platform

**1. Deploy to Render (Recommended - Free Tier)**

```bash
# 1. Create render.yaml in project root (already included)
# 2. Push to GitHub
# 3. Go to render.com
# 4. Connect repository
# 5. Render auto-deploys from render.yaml
```

Your domain will get: `https://vendor-dashboard.onrender.com`

Then configure DNS:
```
CNAME vendor.sufisciencecenter.info -> vendor-dashboard.onrender.com
```

**2. Deploy to Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Configure domain in Railway dashboard
# Point DNS CNAME to Railway URL
```

**3. Deploy to Fly.io**

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy

# Configure domain
fly certs add vendor.sufisciencecenter.info
```

**4. VPS Deployment (Most Control)**

```bash
# SSH to server
ssh user@your-vps.com

# Clone repo
git clone your-repo
cd your-repo

# Install dependencies and build
npm install
npm run build

# Install PM2
npm install -g pm2

# Start server
pm2 start server.cjs --name vendor-dashboard
pm2 save
pm2 startup

# Configure Nginx reverse proxy
# Point domain to http://localhost:3000
```

#### Option B: Serverless Functions (Keep Current Host)

If you must stay on Vercel/Netlify, create serverless functions:

**Vercel API Routes:**
```javascript
// api/health.js
export default function handler(req, res) {
  res.status(200).json({ ok: true });
}

// api/catalog/navigation.js
export default async function handler(req, res) {
  const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/get-catalog-navigation`, {
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}` }
  });
  const data = await response.json();
  res.status(200).json(data);
}
```

**Netlify Functions:**
```javascript
// netlify/functions/health.js
exports.handler = async () => ({
  statusCode: 200,
  body: JSON.stringify({ ok: true })
});

// netlify/functions/catalog-navigation.js
exports.handler = async () => {
  const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/get-catalog-navigation`, {
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}` }
  });
  const data = await response.json();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
};
```

Then configure redirects:
```toml
# netlify.toml
[[redirects]]
  from = "/api/health"
  to = "/.netlify/functions/health"
  status = 200

[[redirects]]
  from = "/api/catalog/navigation"
  to = "/.netlify/functions/catalog-navigation"
  status = 200
```

---

### Issue 3: CORS Errors

**Symptom:** Browser console shows:
```
Access to fetch at 'https://vendor.sufisciencecenter.info/api/health'
has been blocked by CORS policy
```

**Solution:**

Verify CORS headers are present:
```bash
curl -I https://vendor.sufisciencecenter.info/api/health
```

Should include:
```
access-control-allow-origin: *
access-control-allow-methods: GET, OPTIONS
access-control-allow-headers: Content-Type, Authorization
```

If missing, check `server.cjs` has:
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

### Issue 4: 502 Bad Gateway

**Symptom:**
```bash
curl https://vendor.sufisciencecenter.info/api/health
# Returns: 502 Bad Gateway
```

**Diagnosis:** Server crashed or not responding

**Solutions:**

```bash
# Check server status
pm2 status
pm2 logs vendor-dashboard

# Restart server
pm2 restart vendor-dashboard

# If using systemd
systemctl status vendor-dashboard
journalctl -u vendor-dashboard -n 50

# If using Docker
docker logs vendor-dashboard
docker restart vendor-dashboard
```

Common causes:
- Missing environment variables
- Port already in use
- Out of memory
- Supabase credentials invalid

---

## 📊 Current Deployment Detection

Run this to detect your current hosting setup:

```bash
curl -I https://vendor.sufisciencecenter.info
```

**Static Hosting Indicators:**
- `x-vercel-id` header → Vercel
- `x-nf-request-id` header → Netlify
- `server: GitHub.com` → GitHub Pages
- `x-render-origin-server` → Render (static)

**Node Runtime Indicators:**
- `x-powered-by: Express` → Node.js running
- `server: Railway` → Railway
- `fly-request-id` → Fly.io
- Custom server headers → VPS

---

## ✅ Success Criteria Checklist

Run through this checklist to confirm everything works:

```bash
# 1. Health check returns JSON
curl -f https://vendor.sufisciencecenter.info/api/health | jq .ok
# Expected: true

# 2. Navigation returns JSON
curl -f https://vendor.sufisciencecenter.info/api/catalog/navigation | jq .success
# Expected: true

# 3. Taxonomy returns JSON
curl -f https://vendor.sufisciencecenter.info/api/catalog/taxonomy | jq .success
# Expected: true

# 4. Facets returns JSON
curl -f https://vendor.sufisciencecenter.info/api/catalog/facets | jq .success
# Expected: true

# 5. No redirects occur
curl -w "%{num_redirects}" -o /dev/null -s https://vendor.sufisciencecenter.info/api/health
# Expected: 0

# 6. CORS headers present
curl -I https://vendor.sufisciencecenter.info/api/health | grep -i "access-control-allow-origin"
# Expected: access-control-allow-origin: *

# 7. Response time acceptable
time curl -s https://vendor.sufisciencecenter.info/api/health > /dev/null
# Expected: < 2 seconds
```

**All checks passing?** ✅ Production deployment is correct!

**Any checks failing?** ❌ See troubleshooting above.

---

## 🚀 Quick Migration Script (Static → Node.js)

If currently on static hosting, use this to migrate to Render:

```bash
#!/bin/bash

# 1. Ensure render.yaml exists (already in repo)
ls render.yaml

# 2. Push to GitHub
git add .
git commit -m "Add Node.js API server"
git push origin main

# 3. Deploy to Render
echo "Go to https://render.com"
echo "1. Click 'New +' → 'Web Service'"
echo "2. Connect your GitHub repository"
echo "3. Render will detect render.yaml automatically"
echo "4. Add environment variables in Render dashboard:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "5. Click 'Create Web Service'"
echo ""
echo "6. Once deployed, configure DNS:"
echo "   Type: CNAME"
echo "   Name: vendor"
echo "   Value: your-app.onrender.com"
echo ""
echo "7. Wait for DNS propagation (5-60 minutes)"
echo ""
echo "8. Verify:"
echo "   curl -i https://vendor.sufisciencecenter.info/api/health"
```

---

## 📞 Getting Help

If issues persist:

1. **Check server logs:**
   ```bash
   pm2 logs vendor-dashboard --lines 100
   # or
   journalctl -u vendor-dashboard -n 100
   # or
   docker logs vendor-dashboard --tail 100
   ```

2. **Verify environment variables:**
   ```bash
   # On server, check .env file
   cat .env

   # Verify Supabase credentials work
   curl -i "${VITE_SUPABASE_URL}/functions/v1/get-catalog-navigation" \
     -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}"
   ```

3. **Test locally:**
   ```bash
   npm run build
   npm start
   curl http://localhost:3000/api/health
   ```

4. **Check documentation:**
   - [DEPLOYMENT_API_ENDPOINTS.md](./DEPLOYMENT_API_ENDPOINTS.md)
   - [PUBLIC_API_ENDPOINTS.md](./PUBLIC_API_ENDPOINTS.md)

---

## 🎯 One-Line Verification

```bash
curl -f https://vendor.sufisciencecenter.info/api/health && echo "✅ Server is live and responding with JSON" || echo "❌ Server not responding correctly"
```

**✅ Success:** Server is correctly configured and serving JSON

**❌ Failure:** See troubleshooting sections above

---

## Summary

**For a working production deployment, you MUST have:**

1. ✅ Node.js runtime (not static hosting)
2. ✅ `server.cjs` as the start command
3. ✅ Environment variables configured
4. ✅ Domain routing `/api/*` to Node.js server
5. ✅ CORS enabled in Express configuration

**The health endpoint is your first checkpoint:**
```bash
curl -i https://vendor.sufisciencecenter.info/api/health
```

If this returns JSON with `{"ok":true}`, your deployment is correct. If it returns HTML or 404, you need to migrate from static hosting to a Node.js runtime.

---

**Version:** 1.0.0
**Last Updated:** February 3, 2026
