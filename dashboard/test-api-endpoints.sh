#!/bin/bash

# Test script for public API endpoints
# Usage: ./test-api-endpoints.sh [BASE_URL]
# Example: ./test-api-endpoints.sh https://vendor.sufisciencecenter.info

BASE_URL="${1:-http://localhost:3000}"
ENDPOINTS=(
  "/api/health"
  "/api/catalog/navigation"
  "/api/catalog/taxonomy"
  "/api/catalog/facets"
)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "=========================================="
echo "  Testing Public API Endpoints"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

test_endpoint() {
  local endpoint=$1
  local url="$BASE_URL$endpoint"

  echo "----------------------------------------"
  echo "Testing: $endpoint"
  echo "----------------------------------------"

  TOTAL_TESTS=$((TOTAL_TESTS + 5))

  echo -n "1. HTTP Status Check... "
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} (Status: $status)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (Status: $status, Expected: 200)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi

  echo -n "2. Content-Type Check... "
  content_type=$(curl -s -I "$url" | grep -i "content-type" | cut -d':' -f2 | tr -d ' \r')
  if [[ "$content_type" == *"application/json"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} (Content-Type: $content_type)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (Content-Type: $content_type, Expected: application/json)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi

  echo -n "3. Valid JSON Check... "
  response=$(curl -s "$url")
  if echo "$response" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (Response is not valid JSON)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo "First 200 chars of response:"
    echo "$response" | head -c 200
    echo "..."
  fi

  echo -n "4. CORS Headers Check... "
  cors_header=$(curl -s -I "$url" | grep -i "access-control-allow-origin")
  if [ -n "$cors_header" ]; then
    echo -e "${GREEN}✓ PASS${NC} ($cors_header)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (CORS headers missing)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi

  echo -n "5. No Redirect Check... "
  redirect_count=$(curl -s -o /dev/null -w "%{num_redirects}" "$url")
  if [ "$redirect_count" -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC} (No redirects)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗ FAIL${NC} ($redirect_count redirect(s) detected)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi

  echo ""
}

test_options_preflight() {
  local endpoint=$1
  local url="$BASE_URL$endpoint"

  echo "----------------------------------------"
  echo "Testing OPTIONS (CORS Preflight): $endpoint"
  echo "----------------------------------------"

  TOTAL_TESTS=$((TOTAL_TESTS + 2))

  echo -n "1. OPTIONS Request... "
  status=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: GET" \
    "$url")

  if [ "$status" -eq 200 ] || [ "$status" -eq 204 ]; then
    echo -e "${GREEN}✓ PASS${NC} (Status: $status)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (Status: $status)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi

  echo -n "2. CORS Allow Methods... "
  allow_methods=$(curl -s -I -X OPTIONS \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: GET" \
    "$url" | grep -i "access-control-allow-methods")

  if [ -n "$allow_methods" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   $allow_methods"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (CORS methods header missing)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi

  echo ""
}

test_error_handling() {
  local url="$BASE_URL/api/catalog/nonexistent"

  echo "----------------------------------------"
  echo "Testing Error Handling"
  echo "----------------------------------------"

  TOTAL_TESTS=$((TOTAL_TESTS + 3))

  echo -n "1. 404 Response Check... "
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" -eq 404 ]; then
    echo -e "${GREEN}✓ PASS${NC} (Status: 404)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (Status: $status, Expected: 404)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi

  echo -n "2. Error Response is JSON... "
  response=$(curl -s "$url")
  if echo "$response" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (Error response is not JSON)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi

  echo -n "3. Error Contains 'success: false'... "
  if echo "$response" | jq -e '.success == false' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi

  echo ""
}

test_response_time() {
  local endpoint=$1
  local url="$BASE_URL$endpoint"

  echo -n "Response Time: "
  time_total=$(curl -s -o /dev/null -w "%{time_total}" "$url")
  echo "${time_total}s"

  if (( $(echo "$time_total < 2.0" | bc -l) )); then
    echo -e "${GREEN}✓ Good${NC} (< 2s)"
  elif (( $(echo "$time_total < 5.0" | bc -l) )); then
    echo -e "${YELLOW}⚠ Acceptable${NC} (< 5s)"
  else
    echo -e "${RED}⚠ Slow${NC} (> 5s)"
  fi
}

for endpoint in "${ENDPOINTS[@]}"; do
  test_endpoint "$endpoint"
  test_response_time "$endpoint"
  test_options_preflight "$endpoint"
done

test_error_handling

echo "=========================================="
echo "  Test Summary"
echo "=========================================="
echo "Total Tests:  $TOTAL_TESTS"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"

if [ "$FAILED_TESTS" -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  exit 0
else
  echo ""
  echo -e "${RED}✗ Some tests failed!${NC}"
  echo ""
  exit 1
fi
