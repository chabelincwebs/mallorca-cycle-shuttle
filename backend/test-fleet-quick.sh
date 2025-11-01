#!/bin/bash

echo "=== Testing Fleet Management API ==="
echo ""

# Test 1: Try accessing buses without token (should fail)
echo "1. Testing auth requirement (no token)..."
RESPONSE=$(curl -s http://localhost:3001/api/admin/fleet/buses)
echo "Response: $RESPONSE"
echo ""

# Check if we need to create admin user
echo "2. Checking for existing admin..."
# Try login with test credentials
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}')

echo "Login attempt: $LOGIN_RESPONSE"
echo ""

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo "✅ Admin user exists!"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
  echo "Admin user not found - you can test manually with:"
  echo "1. First set your working directory: cd ~/mallorca-cycle-shuttle/backend"
  echo "2. Create admin: npx tsx scripts/create-admin.ts"
  echo "3. Then run this test again"
  exit 1
fi

echo ""
echo "3. Testing Fleet API with token..."
echo ""

# Test buses endpoint
echo "📋 List all buses:"
curl -s http://localhost:3001/api/admin/fleet/buses \
  -H "Authorization: Bearer $TOKEN" | head -20
echo ""
echo ""

# Test routes endpoint
echo "🗺️  List all routes:"
curl -s http://localhost:3001/api/admin/fleet/routes \
  -H "Authorization: Bearer $TOKEN" | head -20
echo ""
echo ""

echo "✅ Fleet API tests complete!"
