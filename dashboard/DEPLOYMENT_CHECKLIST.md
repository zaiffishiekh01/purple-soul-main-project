# Production Deployment Checklist

Use this checklist to ensure correct deployment to production.

---

## Pre-Deployment

### 1. Environment Variables

- [ ] `VITE_SUPABASE_URL` is set
- [ ] `VITE_SUPABASE_ANON_KEY` is set
- [ ] Values match your production Supabase project
- [ ] Values are NOT committed to git

**Verify:**
```bash
cat .env
```

### 2. Build Test

- [ ] Project builds without errors
- [ ] TypeScript compiles successfully
- [ ] No critical warnings

**Verify:**
```bash
npm run build
```

### 3. Local Server Test

- [ ] Server starts successfully
- [ ] Health endpoint returns JSON
- [ ] API endpoints return data
- [ ] CORS headers present

**Verify:**
```bash
npm start

# In another terminal:
curl http://localhost:3000/api/health
curl http://localhost:3000/api/catalog/navigation
```

---

## Deployment Platform Selection

Choose ONE platform and complete its checklist:

### Option A: Render (Recommended - Free Tier)

- [ ] GitHub repository connected
- [ ] `render.yaml` file present in repo
- [ ] Environment variables added in Render dashboard:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `node server.cjs`
- [ ] Deploy triggered
- [ ] Deployment successful
- [ ] Health check URL: `https://your-app.onrender.com/api/health`

**Configure DNS:**
```
Type: CNAME
Name: vendor
Value: your-app.onrender.com
TTL: 3600
```

### Option B: Railway

- [ ] Railway CLI installed: `npm install -g @railway/cli`
- [ ] Logged in: `railway login`
- [ ] Project initialized: `railway init`
- [ ] Environment variables set:
  ```bash
  railway variables set VITE_SUPABASE_URL=...
  railway variables set VITE_SUPABASE_ANON_KEY=...
  ```
- [ ] Deployed: `railway up`
- [ ] Domain configured in Railway dashboard
- [ ] Health check working

### Option C: Fly.io

- [ ] Fly CLI installed
- [ ] Logged in: `fly auth login`
- [ ] App launched: `fly launch`
- [ ] Environment variables set:
  ```bash
  fly secrets set VITE_SUPABASE_URL=...
  fly secrets set VITE_SUPABASE_ANON_KEY=...
  ```
- [ ] Deployed: `fly deploy`
- [ ] Certificate added: `fly certs add vendor.sufisciencecenter.info`
- [ ] DNS configured to Fly

### Option D: VPS with PM2

- [ ] Node.js 18+ installed on server
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] Code deployed to server
- [ ] Dependencies installed: `npm install`
- [ ] Project built: `npm run build`
- [ ] `.env` file uploaded with correct values
- [ ] PM2 started: `pm2 start server.cjs --name vendor-dashboard`
- [ ] PM2 saved: `pm2 save`
- [ ] PM2 startup configured: `pm2 startup`
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Nginx reloaded: `sudo systemctl reload nginx`

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name vendor.sufisciencecenter.info;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option E: Docker

- [ ] Docker installed
- [ ] Image built: `docker build -t vendor-dashboard .`
- [ ] Container running:
  ```bash
  docker run -d --name vendor-dashboard -p 3000:3000 \
    -e VITE_SUPABASE_URL="..." \
    -e VITE_SUPABASE_ANON_KEY="..." \
    vendor-dashboard
  ```
- [ ] Container healthy: `docker ps`
- [ ] Logs clean: `docker logs vendor-dashboard`
- [ ] Reverse proxy configured (Nginx/Traefik/Caddy)
- [ ] SSL certificate configured

---

## Post-Deployment Verification

### 1. Health Check (Critical)

```bash
curl -i https://vendor.sufisciencecenter.info/api/health
```

**Must return:**
- [ ] Status: 200 OK
- [ ] Content-Type: application/json
- [ ] Body contains: `{"ok":true}`
- [ ] CORS headers present
- [ ] NO HTML in response
- [ ] NO redirects

### 2. Navigation Endpoint

```bash
curl -i https://vendor.sufisciencecenter.info/api/catalog/navigation
```

**Must return:**
- [ ] Status: 200 OK
- [ ] Content-Type: application/json
- [ ] Body contains: `{"success":true,"data":{...}}`
- [ ] CORS headers present

### 3. Taxonomy Endpoint

```bash
curl -i https://vendor.sufisciencecenter.info/api/catalog/taxonomy
```

**Must return:**
- [ ] Status: 200 OK
- [ ] Content-Type: application/json
- [ ] Valid JSON response

### 4. Facets Endpoint

```bash
curl -i https://vendor.sufisciencecenter.info/api/catalog/facets
```

**Must return:**
- [ ] Status: 200 OK
- [ ] Content-Type: application/json
- [ ] Valid JSON response

### 5. CORS Verification

Open browser console on ANY domain:
```javascript
fetch('https://vendor.sufisciencecenter.info/api/health')
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e));
```

**Must show:**
- [ ] No CORS errors in console
- [ ] Data logged successfully

### 6. Error Handling

```bash
curl -i https://vendor.sufisciencecenter.info/api/catalog/invalid
```

**Must return:**
- [ ] Status: 404
- [ ] Content-Type: application/json
- [ ] Body contains: `{"success":false,"error":"API endpoint not found"}`
- [ ] NOT HTML

### 7. Redirect Check

```bash
curl -w "\nRedirects: %{num_redirects}\n" -o /dev/null -s https://vendor.sufisciencecenter.info/api/health
```

**Must show:**
- [ ] Redirects: 0

### 8. Automated Test Suite

```bash
./verify-production.sh https://vendor.sufisciencecenter.info
```

**Must show:**
- [ ] All tests passing
- [ ] Green checkmarks for all endpoints
- [ ] Final message: "Production deployment is CORRECT!"

---

## Common Failure Scenarios

### Scenario 1: Health Returns HTML

**Symptoms:**
```bash
curl https://vendor.sufisciencecenter.info/api/health
# Returns: <!DOCTYPE html>...
```

**Diagnosis:** Still on static hosting

**Solution:**
- [ ] Migrate to Node.js platform (Render/Railway/Fly/VPS)
- [ ] OR create serverless functions on current platform
- [ ] See PRODUCTION_VERIFICATION.md for migration steps

### Scenario 2: Health Returns 404

**Symptoms:**
```bash
curl https://vendor.sufisciencecenter.info/api/health
# Returns: 404 Not Found
```

**Diagnosis:** Server not running or routing incorrect

**Solution:**
- [ ] Check server status: `pm2 status`
- [ ] Check logs: `pm2 logs vendor-dashboard`
- [ ] Restart if needed: `pm2 restart vendor-dashboard`
- [ ] Verify Nginx config if using reverse proxy

### Scenario 3: Health Returns 502

**Symptoms:**
```bash
curl https://vendor.sufisciencecenter.info/api/health
# Returns: 502 Bad Gateway
```

**Diagnosis:** Server crashed or not responding

**Solution:**
- [ ] Check logs: `pm2 logs vendor-dashboard --lines 100`
- [ ] Check environment variables: `pm2 env 0`
- [ ] Verify `.env` file exists and has correct values
- [ ] Restart: `pm2 restart vendor-dashboard`
- [ ] Check port conflicts: `lsof -i :3000`

### Scenario 4: CORS Errors

**Symptoms:** Browser console shows CORS policy error

**Diagnosis:** CORS headers not being sent

**Solution:**
- [ ] Verify CORS middleware in `server.cjs`
- [ ] Check headers: `curl -I https://vendor.sufisciencecenter.info/api/health | grep -i access-control`
- [ ] Ensure `cors` package is installed: `npm list cors`
- [ ] Restart server after code changes

---

## DNS Configuration

### Requirements

- [ ] Domain points to your deployment
- [ ] DNS propagation complete (check: https://dnschecker.org)
- [ ] SSL certificate issued
- [ ] HTTPS working (not just HTTP)

### DNS Record Setup

**For Render/Railway/Fly:**
```
Type: CNAME
Name: vendor (or @)
Value: your-app.platform.com
TTL: 3600
```

**For VPS:**
```
Type: A
Name: vendor (or @)
Value: your.server.ip.address
TTL: 3600
```

### Verify DNS

```bash
# Check DNS resolution
dig vendor.sufisciencecenter.info

# Check DNS from multiple locations
curl https://dnschecker.org/all-dns-records-of-domain.php?query=vendor.sufisciencecenter.info
```

---

## SSL/HTTPS Configuration

- [ ] SSL certificate installed
- [ ] HTTPS enabled
- [ ] HTTP redirects to HTTPS
- [ ] Certificate auto-renewal configured (if Let's Encrypt)

**Verify:**
```bash
curl -I https://vendor.sufisciencecenter.info/api/health
# Should return 200, not redirect to http://
```

---

## Monitoring Setup (Recommended)

### Uptime Monitoring

- [ ] Uptime monitor configured (UptimeRobot, StatusCake, etc.)
- [ ] Monitor URL: `https://vendor.sufisciencecenter.info/api/health`
- [ ] Check interval: 5 minutes
- [ ] Alert email configured

### Log Monitoring

- [ ] Log aggregation configured (if using VPS)
- [ ] Error alerts configured
- [ ] Log rotation enabled

**PM2 Monitoring:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Performance Benchmarks

Expected response times:

- [ ] `/api/health` < 100ms
- [ ] `/api/catalog/navigation` < 500ms
- [ ] `/api/catalog/taxonomy` < 500ms
- [ ] `/api/catalog/facets` < 400ms

**Test:**
```bash
time curl -s https://vendor.sufisciencecenter.info/api/health > /dev/null
```

---

## Rollback Plan

If deployment fails:

1. **Identify issue:**
   ```bash
   ./verify-production.sh https://vendor.sufisciencecenter.info
   ```

2. **Check logs:**
   ```bash
   pm2 logs vendor-dashboard --lines 100
   ```

3. **Rollback options:**

   **PM2:**
   ```bash
   pm2 stop vendor-dashboard
   # Restore previous version
   git checkout previous-version
   npm run build
   pm2 restart vendor-dashboard
   ```

   **Docker:**
   ```bash
   docker stop vendor-dashboard
   docker run previous-image
   ```

   **Platform (Render/Railway):**
   - Use platform's rollback feature
   - Or redeploy previous commit

4. **Verify rollback:**
   ```bash
   curl https://vendor.sufisciencecenter.info/api/health
   ```

---

## Final Verification Command

```bash
./verify-production.sh https://vendor.sufisciencecenter.info && echo "✅ DEPLOYMENT SUCCESSFUL" || echo "❌ DEPLOYMENT FAILED"
```

---

## Documentation Updates

After successful deployment:

- [ ] Update README with production URL
- [ ] Document any platform-specific configurations
- [ ] Update team on new API endpoints
- [ ] Provide storefront team with integration guide

---

## Success Criteria

**All of the following must be true:**

- [x] Health endpoint returns `{"ok":true}`
- [x] All three catalog endpoints return JSON with `{"success":true}`
- [x] No HTML in API responses
- [x] No redirects (0 redirect count)
- [x] CORS headers present on all responses
- [x] Works from browser without CORS errors
- [x] Error responses are JSON (not HTML)
- [x] DNS resolves correctly
- [x] HTTPS enabled
- [x] Response times acceptable
- [x] Automated tests pass

**If all checked:** ✅ Production deployment is complete and correct!

**If any unchecked:** ❌ Review failed items and consult troubleshooting guides.

---

## Quick Reference

| Check | Command |
|-------|---------|
| Health | `curl https://vendor.sufisciencecenter.info/api/health` |
| Navigation | `curl https://vendor.sufisciencecenter.info/api/catalog/navigation` |
| Full test | `./verify-production.sh https://vendor.sufisciencecenter.info` |
| Server status | `pm2 status` |
| Server logs | `pm2 logs vendor-dashboard` |
| Restart | `pm2 restart vendor-dashboard` |

---

**Version:** 1.0.0
**Last Updated:** February 3, 2026
