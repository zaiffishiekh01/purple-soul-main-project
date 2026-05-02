# Quick Production Verification

## One-Command Check

```bash
./verify-production.sh https://vendor.sufisciencecenter.info
```

---

## Manual 30-Second Check

### 1. Health Check (Most Important)

```bash
curl -i https://vendor.sufisciencecenter.info/api/health
```

**✅ Success Looks Like:**
```
HTTP/2 200
content-type: application/json
access-control-allow-origin: *

{"ok":true,"timestamp":"...","uptime":123,"environment":"production","version":"1.0.0"}
```

**❌ Failure Looks Like:**
```
HTTP/2 200
content-type: text/html

<!DOCTYPE html>
<html>...
```

---

### 2. Navigation API

```bash
curl https://vendor.sufisciencecenter.info/api/catalog/navigation | jq .success
```

**Expected:** `true`

**If you see HTML:** You're on static hosting. Need Node.js runtime.

---

## Troubleshooting Decision Tree

```
Health endpoint returns HTML?
│
├─ YES → You're on static hosting (Vercel/Netlify/GitHub Pages)
│        → Solution: Deploy to Node.js platform (Render/Railway/Fly/VPS)
│        → See PRODUCTION_VERIFICATION.md for migration guide
│
└─ NO (returns JSON)
   │
   ├─ Returns {"ok":true}?
   │  │
   │  ├─ YES → ✅ Server is working correctly!
   │  │        Test other endpoints
   │  │
   │  └─ NO → Check response format
   │           Verify Next.js is deployed
   │
   └─ Returns 404?
      │
      └─ Server not routing /api/* correctly
         Check reverse proxy configuration (Nginx/Caddy)
         Verify server is running: pm2 status
```

---

## Quick Fixes

### If Health Returns HTML

**You're on static hosting. Migrate to Node.js:**

#### Fastest: Deploy to Render (5 minutes)

1. Push code to GitHub
2. Go to https://render.com
3. New Web Service → Connect repo
4. Render detects `render.yaml` automatically
5. Add env vars: `NEXTAUTH_URL`, `AUTH_SECRET`
6. Deploy
7. Point DNS CNAME to Render URL

#### Alternative: Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Add env vars in Railway dashboard, then configure domain.

---

### If Health Returns 404

**Server not running or not routing correctly:**

```bash
# Check if server is running
pm2 status

# If not running
cd /path/to/project
npm run build
pm2 start npm --name vendor-dashboard -- start

# Check logs
pm2 logs vendor-dashboard
```

---

### If Health Returns 502

**Server crashed:**

```bash
# Check logs
pm2 logs vendor-dashboard --lines 100

# Common issues:
# - Missing .env file
# - Invalid Supabase credentials
# - Port already in use

# Restart
pm2 restart vendor-dashboard
```

---

## Current Hosting Detection

```bash
curl -I https://vendor.sufisciencecenter.info | grep -i server
```

**Results:**
- `x-vercel-id` → Vercel (static) ❌ Need to migrate
- `x-nf-request-id` → Netlify (static) ❌ Need to migrate
- `server: GitHub.com` → GitHub Pages ❌ Need to migrate
- `x-powered-by: Express` → Node.js running ✅ Correct!
- `server: Railway` → Railway ✅ Correct!
- `fly-request-id` → Fly.io ✅ Correct!

---

## Integration Test (Browser)

Open console on **any domain**:

```javascript
fetch('https://vendor.sufisciencecenter.info/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Server responding:', d))
  .catch(e => console.error('❌ Error:', e));
```

**No CORS error** = Working correctly
**CORS error** = Server not sending headers

---

## Success Checklist

- [ ] `curl https://vendor.sufisciencecenter.info/api/health` returns JSON with `{"ok":true}`
- [ ] `curl https://vendor.sufisciencecenter.info/api/catalog/navigation` returns JSON with `{"success":true}`
- [ ] No HTML in responses
- [ ] No 30x redirects
- [ ] CORS headers present
- [ ] Works from browser without CORS errors

**All checked?** ✅ Production is ready!

**Some unchecked?** See PRODUCTION_VERIFICATION.md for detailed troubleshooting.

---

## Emergency Contact Points

1. **Server logs:** `pm2 logs vendor-dashboard`
2. **Restart server:** `pm2 restart vendor-dashboard`
3. **Check environment:** `cat .env` (on server)
4. **Test Supabase:** `curl -i ${SUPABASE_URL}/api/catalog/navigation`

---

**Quick Verification:** `./verify-production.sh https://vendor.sufisciencecenter.info`
