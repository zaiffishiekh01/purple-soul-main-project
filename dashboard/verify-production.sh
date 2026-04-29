#!/bin/bash

PRODUCTION_URL="${1:-https://vendor.sufisciencecenter.info}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}=========================================="
echo "  Production API Verification"
echo "==========================================${NC}"
echo "Target: $PRODUCTION_URL"
echo ""

PASSED=0
FAILED=0

check() {
  local name=$1
  local url=$2
  local expected_status=${3:-200}

  echo -n "Checking $name... "

  response=$(curl -s -w "\n%{http_code}\n%{content_type}\n%{num_redirects}" "$url" 2>&1)
  body=$(echo "$response" | head -n -3)
  status=$(echo "$response" | tail -n 3 | head -n 1)
  content_type=$(echo "$response" | tail -n 2 | head -n 1)
  redirects=$(echo "$response" | tail -n 1)

  if [ "$status" != "$expected_status" ]; then
    echo -e "${RED}✗ FAIL${NC} (Status: $status, Expected: $expected_status)"
    FAILED=$((FAILED + 1))
    return 1
  fi

  if [[ ! "$content_type" =~ "application/json" ]]; then
    echo -e "${RED}✗ FAIL${NC} (Content-Type: $content_type, Expected: application/json)"
    if [[ "$body" == *"<!DOCTYPE"* ]] || [[ "$body" == *"<html"* ]]; then
      echo -e "  ${YELLOW}⚠ Response is HTML, not JSON${NC}"
      echo -e "  ${YELLOW}⚠ This means you're on static hosting and need to migrate to Node.js runtime${NC}"
    fi
    FAILED=$((FAILED + 1))
    return 1
  fi

  if [ "$redirects" != "0" ]; then
    echo -e "${RED}✗ FAIL${NC} (Redirects: $redirects, Expected: 0)"
    FAILED=$((FAILED + 1))
    return 1
  fi

  if ! echo "$body" | jq . > /dev/null 2>&1; then
    echo -e "${RED}✗ FAIL${NC} (Invalid JSON)"
    echo "  First 200 chars: ${body:0:200}"
    FAILED=$((FAILED + 1))
    return 1
  fi

  echo -e "${GREEN}✓ PASS${NC}"
  PASSED=$((PASSED + 1))
  return 0
}

echo -e "${BOLD}1. Health Check (Critical)${NC}"
echo "   This verifies the Node.js server is running"
echo ""

if check "Health endpoint" "$PRODUCTION_URL/api/health" 200; then
  health_data=$(curl -s "$PRODUCTION_URL/api/health")
  ok_value=$(echo "$health_data" | jq -r .ok 2>/dev/null)
  if [ "$ok_value" = "true" ]; then
    echo -e "   ${GREEN}✓ Server is live and responding${NC}"
    echo "   Uptime: $(echo "$health_data" | jq -r .uptime)s"
    echo "   Environment: $(echo "$health_data" | jq -r .environment)"
  fi
else
  echo ""
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}${BOLD}CRITICAL: Health check failed!${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "Diagnosis:"
  echo ""

  response_start=$(curl -s "$PRODUCTION_URL/api/health" | head -c 100)

  if [[ "$response_start" == *"<!DOCTYPE"* ]] || [[ "$response_start" == *"<html"* ]]; then
    echo -e "${YELLOW}⚠ You are on STATIC HOSTING${NC}"
    echo ""
    echo "The endpoint is returning HTML (your React app) instead of JSON."
    echo "This happens when using Vercel, Netlify, GitHub Pages, etc."
    echo ""
    echo "Solutions:"
    echo ""
    echo "  Option 1: Migrate to Node.js hosting (Recommended)"
    echo "    • Render (free tier): https://render.com"
    echo "    • Railway: https://railway.app"
    echo "    • Fly.io: https://fly.io"
    echo "    • VPS with PM2"
    echo ""
    echo "  Option 2: Create serverless functions on your current platform"
    echo "    • See PRODUCTION_VERIFICATION.md for examples"
    echo ""
    echo "Current setup cannot run Express server!"
  else
    echo "  • Server may not be running"
    echo "  • Check logs: pm2 logs vendor-dashboard"
    echo "  • Verify environment variables"
    echo "  • Check DNS configuration"
  fi
  echo ""
  echo "See PRODUCTION_VERIFICATION.md for detailed troubleshooting"
  echo ""
  exit 1
fi

echo ""
echo -e "${BOLD}2. Catalog API Endpoints${NC}"
echo ""

check "Navigation endpoint" "$PRODUCTION_URL/api/catalog/navigation" 200
check "Taxonomy endpoint" "$PRODUCTION_URL/api/catalog/taxonomy" 200
check "Facets endpoint" "$PRODUCTION_URL/api/catalog/facets" 200

echo ""
echo -e "${BOLD}3. CORS Headers${NC}"
echo ""

echo -n "Checking CORS headers... "
cors_header=$(curl -s -I "$PRODUCTION_URL/api/health" | grep -i "access-control-allow-origin")
if [ -n "$cors_header" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  echo "   $cors_header"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC}"
  echo "   CORS headers missing"
  FAILED=$((FAILED + 1))
fi

echo ""
echo -e "${BOLD}4. Error Handling${NC}"
echo ""

check "404 error response" "$PRODUCTION_URL/api/catalog/nonexistent" 404

echo ""
echo "=========================================="
echo -e "${BOLD}  Verification Summary${NC}"
echo "=========================================="
echo "Total Checks: $((PASSED + FAILED))"
echo -e "Passed:       ${GREEN}$PASSED${NC}"
echo -e "Failed:       ${RED}$FAILED${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✓ Production deployment is CORRECT!${NC}"
  echo ""
  echo "All API endpoints are:"
  echo "  ✓ Returning JSON (not HTML)"
  echo "  ✓ Accessible without authentication"
  echo "  ✓ CORS-enabled for cross-origin requests"
  echo "  ✓ Properly handling errors"
  echo ""
  echo "Your storefront can now integrate with:"
  echo "  • $PRODUCTION_URL/api/catalog/navigation"
  echo "  • $PRODUCTION_URL/api/catalog/taxonomy"
  echo "  • $PRODUCTION_URL/api/catalog/facets"
  echo ""
  exit 0
else
  echo -e "${RED}${BOLD}✗ Production deployment has ISSUES!${NC}"
  echo ""
  echo "See detailed diagnostics above."
  echo "Refer to PRODUCTION_VERIFICATION.md for solutions."
  echo ""
  exit 1
fi
