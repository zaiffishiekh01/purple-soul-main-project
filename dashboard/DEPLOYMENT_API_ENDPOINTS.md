# Deployment Guide - Public API Endpoints

## Quick Start

This guide explains how to deploy the vendor dashboard with public API endpoints at `/api/catalog/*`.

---

## Prerequisites

- Node.js 18+ installed
- `.env` file with Supabase credentials
- Built React application (`npm run build`)

---

## Local Development

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create `.env` file:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
```

### Step 3: Build and Start

```bash
# Build the React app
npm run build

# Start the server
npm start
```

### Step 4: Test Endpoints

```bash
# Test navigation endpoint
curl http://localhost:3000/api/catalog/navigation

# Test taxonomy endpoint
curl http://localhost:3000/api/catalog/taxonomy

# Test facets endpoint
curl http://localhost:3000/api/catalog/facets
```

Or use the automated test script:
```bash
./test-api-endpoints.sh http://localhost:3000
```

---

## Production Deployment

### Option 1: Simple Node.js Server

**Best for:** VPS, dedicated servers, AWS EC2, DigitalOcean Droplets

#### Deploy Steps

1. **Upload files to server:**
   ```bash
   scp -r dist/ server.cjs package.json .env user@your-server.com:/var/www/vendor-dashboard/
   ```

2. **SSH into server:**
   ```bash
   ssh user@your-server.com
   cd /var/www/vendor-dashboard
   ```

3. **Install dependencies:**
   ```bash
   npm install express cors dotenv
   ```

4. **Start server:**
   ```bash
   node server.cjs
   ```

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start server.cjs --name vendor-dashboard

# Configure auto-restart on reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs vendor-dashboard

# Restart after updates
pm2 restart vendor-dashboard
```

#### Using systemd

Create `/etc/systemd/system/vendor-dashboard.service`:
```ini
[Unit]
Description=Vendor Dashboard
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/vendor-dashboard
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/vendor-dashboard/.env
ExecStart=/usr/bin/node /var/www/vendor-dashboard/server.cjs
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable vendor-dashboard
sudo systemctl start vendor-dashboard
sudo systemctl status vendor-dashboard
```

#### Nginx Reverse Proxy

Create `/etc/nginx/sites-available/vendor-dashboard`:
```nginx
server {
    listen 80;
    server_name vendor.sufisciencecenter.info;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optional: Cache API responses
    location /api/catalog/ {
        proxy_pass http://localhost:3000;
        proxy_cache api_cache;
        proxy_cache_valid 200 1h;
        proxy_cache_use_stale error timeout http_500 http_502 http_503;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/vendor-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d vendor.sufisciencecenter.info
```

---

### Option 2: Vercel Deployment

**Best for:** Serverless, automatic scaling, easy deployment

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Create `vercel.json`

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
  ],
  "env": {
    "VITE_SUPABASE_URL": "@vite-supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@vite-supabase-anon-key"
  }
}
```

#### Step 3: Add Environment Variables

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

#### Step 4: Deploy

```bash
npm run build
vercel --prod
```

---

### Option 3: Render Deployment

**Best for:** Easy deployment, free tier available

#### Step 1: Create `render.yaml`

```yaml
services:
  - type: web
    name: vendor-dashboard
    env: node
    buildCommand: npm install && npm run build
    startCommand: node server.cjs
    envVars:
      - key: NODE_VERSION
        value: "22"
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false
    healthCheckPath: /api/catalog/navigation
```

#### Step 2: Connect Repository

1. Go to https://render.com
2. Connect your GitHub repository
3. Render will auto-detect `render.yaml`
4. Add environment variables in dashboard
5. Deploy

---

### Option 4: Railway Deployment

**Best for:** Quick deployment, integrated database support

#### Deploy via CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set VITE_SUPABASE_URL=https://your-project.supabase.co
railway variables set VITE_SUPABASE_ANON_KEY=your-key

# Deploy
railway up
```

---

### Option 5: Docker Container

**Best for:** Consistent deployments, Kubernetes, cloud platforms

#### Create `Dockerfile`

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install express cors dotenv

COPY dist ./dist
COPY server.cjs ./

EXPOSE 3000

CMD ["node", "server.cjs"]
```

#### Create `.dockerignore`

```
node_modules
npm-debug.log
.env
.git
.gitignore
*.md
src
public
```

#### Build and Run

```bash
# Build image
docker build -t vendor-dashboard .

# Run container
docker run -d \
  --name vendor-dashboard \
  -p 3000:3000 \
  -e VITE_SUPABASE_URL="https://your-project.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="your-key" \
  vendor-dashboard

# Check logs
docker logs -f vendor-dashboard

# Test
curl http://localhost:3000/api/catalog/navigation
```

#### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/catalog/navigation"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run:
```bash
docker-compose up -d
```

---

## Environment Variables

Required variables in `.env`:

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration (Optional)
PORT=3000
NODE_ENV=production
```

---

## Testing After Deployment

### 1. Basic Connectivity

```bash
curl -i https://vendor.sufisciencecenter.info/api/catalog/navigation
```

**Expected:**
- Status: 200 OK
- Content-Type: application/json
- Valid JSON body

### 2. CORS from Browser

Open browser console and run:
```javascript
fetch('https://vendor.sufisciencecenter.info/api/catalog/navigation')
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e));
```

**Expected:** No CORS errors, data logged to console

### 3. All Endpoints

```bash
# Navigation
curl https://vendor.sufisciencecenter.info/api/catalog/navigation | jq .

# Taxonomy
curl https://vendor.sufisciencecenter.info/api/catalog/taxonomy | jq .

# Facets
curl https://vendor.sufisciencecenter.info/api/catalog/facets | jq .
```

### 4. Automated Test Suite

```bash
./test-api-endpoints.sh https://vendor.sufisciencecenter.info
```

**Expected:** All tests pass with green checkmarks

---

## Monitoring

### Health Check Endpoint

The navigation endpoint can be used as a health check:
```bash
curl -f https://vendor.sufisciencecenter.info/api/catalog/navigation
```

### Uptime Monitoring

Configure monitoring services:
- **UptimeRobot:** https://uptimerobot.com
- **StatusCake:** https://www.statuscake.com
- **Pingdom:** https://www.pingdom.com

Monitor URL: `https://vendor.sufisciencecenter.info/api/catalog/navigation`

### Logs

```bash
# PM2
pm2 logs vendor-dashboard --lines 100

# systemd
journalctl -u vendor-dashboard -f

# Docker
docker logs -f vendor-dashboard

# Direct node (save to file)
node server.cjs >> logs/app.log 2>&1
```

---

## Troubleshooting

### Issue: Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 node server.cjs
```

### Issue: Permission Denied

```bash
# Allow binding to port 80 without root (Linux)
sudo setcap 'cap_net_bind_service=+ep' $(which node)

# Or use port > 1024 and proxy with nginx
```

### Issue: Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm install express cors dotenv
```

### Issue: 502 Bad Gateway (Nginx)

```bash
# Check if app is running
pm2 status

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify proxy_pass URL
sudo nginx -t
```

### Issue: API Returns HTML Instead of JSON

**Cause:** React Router catching the route

**Solution:** Ensure API routes are defined BEFORE static file serving in `server.cjs`

### Issue: CORS Errors

**Cause:** CORS middleware not configured

**Solution:** Verify `app.use(cors({ origin: '*' }))` is present

---

## Performance Optimization

### 1. Enable Response Compression

```bash
npm install compression
```

Update `server.cjs`:
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Add Rate Limiting

```bash
npm install express-rate-limit
```

Update `server.cjs`:
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', apiLimiter);
```

### 3. Nginx Caching

Add to nginx config:
```nginx
proxy_cache_path /var/cache/nginx/api levels=1:2 keys_zone=api_cache:10m max_size=100m;

location /api/catalog/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 1h;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
}
```

---

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured (not in code)
- [ ] Firewall configured (only ports 80, 443 open)
- [ ] Rate limiting enabled
- [ ] Server kept updated (security patches)
- [ ] Logs reviewed regularly
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

---

## Backup & Restore

### Backup

```bash
# Backup .env file
cp .env .env.backup

# Backup dist folder
tar -czf dist-backup-$(date +%Y%m%d).tar.gz dist/

# Backup server script
cp server.cjs server.cjs.backup
```

### Restore

```bash
# Restore from backup
tar -xzf dist-backup-20260203.tar.gz
cp .env.backup .env
pm2 restart vendor-dashboard
```

---

## Scaling

### Horizontal Scaling

Run multiple instances behind a load balancer:

```bash
# Start multiple instances
pm2 start server.cjs -i 4 --name vendor-dashboard
```

### Load Balancer (Nginx)

```nginx
upstream vendor_dashboard {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    location / {
        proxy_pass http://vendor_dashboard;
    }
}
```

---

## CI/CD Pipeline Example

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to server
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          SERVER_HOST: ${{ secrets.SERVER_HOST }}
          SERVER_USER: ${{ secrets.SERVER_USER }}
        run: |
          echo "$SSH_PRIVATE_KEY" > key.pem
          chmod 600 key.pem
          rsync -avz -e "ssh -i key.pem -o StrictHostKeyChecking=no" \
            dist/ server.cjs package.json \
            $SERVER_USER@$SERVER_HOST:/var/www/vendor-dashboard/
          ssh -i key.pem $SERVER_USER@$SERVER_HOST \
            "cd /var/www/vendor-dashboard && npm install && pm2 restart vendor-dashboard"
```

---

## Summary

**✅ Server Setup Complete**
- Express server with API routes
- CORS enabled
- JSON responses only
- Public access (no auth)
- Error handling

**✅ Deployment Options**
- Node.js server (VPS)
- Vercel (serverless)
- Render (platform)
- Railway (platform)
- Docker (containers)

**✅ Testing**
- Automated test script
- Manual verification steps
- Health checks

**✅ Production Ready**
- PM2 process management
- Nginx reverse proxy
- SSL/HTTPS
- Monitoring

---

**Status:** Ready for production deployment
**Version:** 1.0.0
**Last Updated:** February 3, 2026
