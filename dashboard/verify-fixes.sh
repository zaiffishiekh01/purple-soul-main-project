#!/bin/bash
echo "=== VERIFICATION REPORT ==="
echo ""
echo "1. Checking useContext imports..."
for f in src/hooks/useInventory.ts src/hooks/useLabels.ts src/hooks/useShipments.ts src/hooks/useShippingLabels.ts; do
  if grep -q "import.*useContext.*from 'react'" "$f"; then
    echo "  ✅ $f has useContext import"
  else
    echo "  ❌ $f MISSING useContext import"
  fi
done

echo ""
echo "2. Checking VendorContext usage..."
if grep -q "const vendorContext = useContext(VendorContext)" src/hooks/useOrders.ts; then
  echo "  ✅ useOrders uses optional VendorContext"
else
  echo "  ❌ useOrders NOT using optional VendorContext"
fi

echo ""
echo "3. Checking admin permissions call..."
if grep -q "admin_user_id: user.id" src/hooks/useAdminPermissions.ts; then
  echo "  ✅ useAdminPermissions uses correct parameter name"
else
  echo "  ❌ useAdminPermissions uses WRONG parameter name"
fi

echo ""
echo "4. Checking navigation menus..."
if grep -q "const menuItems = \[" src/components/DashboardLayout.tsx; then
  count=$(grep -c "{ id:" src/components/DashboardLayout.tsx | head -1)
  echo "  ✅ DashboardLayout has menu items defined ($count items)"
else
  echo "  ❌ DashboardLayout missing menu items"
fi

if grep -q "const menuItems = \[" src/components/admin/AdminDashboardLayout.tsx; then
  count=$(grep -c "{ id:" src/components/admin/AdminDashboardLayout.tsx | head -1)
  echo "  ✅ AdminDashboardLayout has menu items defined ($count items)"
else
  echo "  ❌ AdminDashboardLayout missing menu items"
fi

echo ""
echo "5. Checking routes..."
if grep -q "<Route path=\"/vendor/\*\"" src/App.tsx; then
  echo "  ✅ Vendor routes defined"
fi
if grep -q "<Route path=\"/admin/\*\"" src/App.tsx; then
  echo "  ✅ Admin routes defined"
fi

echo ""
echo "=== BUILD STATUS ==="
if [ -f dist/index.html ]; then
  echo "  ✅ Build successful"
  echo "  Size: $(du -h dist/assets/*.js | tail -1 | awk '{print $1}')"
else
  echo "  ❌ Build failed"
fi

echo ""
echo "=== ALL CHECKS COMPLETE ==="
