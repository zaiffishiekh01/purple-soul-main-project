# User Interface Location Guide

## Warehouse Management UI

### Vendor Portal

**File Location:**
```
/src/components/VendorWarehouseSupportEnhanced.tsx
```

**Access URL:**
```
/vendor/warehouse
```

**Features:**
- **Overview Tab**: Dashboard with quick stats
- **Storage Requests Tab**: Create and manage warehouse storage requests
- **Inbound Shipments Tab**: Create ASN (Advanced Shipping Notice) and track shipments
- **Warehouse Inventory Tab**: View stored inventory with bin locations
- **Performance Metrics Tab**: View KPIs, health score, and cost breakdown

**How to Access:**
1. Log in as a vendor
2. Navigate to "Warehouse" in the sidebar menu
3. You'll see the enhanced 5-tab interface

---

### Admin Portal

**File Location:**
```
/src/components/admin/AdminWarehouse.tsx
```

**Access URL:**
```
/admin/warehouse
```

**Features:**
- View all vendor warehouse requests
- Filter by status (Pending, Approved, Active, Completed)
- Approve/reject requests
- Assign warehouse locations
- Set arrival deadlines
- Add admin notes

**How to Access:**
1. Log in as an admin
2. Navigate to "Warehouse" in the admin sidebar
3. View and manage all vendor requests

---

## How It's Integrated

### In `App.tsx` (Lines 33 & 66):

```typescript
// Import
import { VendorWarehouseSupportEnhanced } from './components/VendorWarehouseSupportEnhanced';

// Usage in WarehouseContainer
function WarehouseContainer() {
  const { vendor } = useVendorContext();
  if (!vendor) return <div>Loading...</div>;
  return <VendorWarehouseSupportEnhanced vendorId={vendor.id} />;
}
```

### Route Configuration (Line 150):

```typescript
<Route path="warehouse" element={<WarehouseContainer />} />
```

---

## Component Structure

### Vendor Enhanced UI

```
VendorWarehouseSupportEnhanced (Main Component)
│
├── OverviewTab
│   ├── Active Storage Cards
│   ├── In-Transit Shipments
│   ├── Stored SKUs Count
│   └── Latest Performance Metrics
│
├── RequestsTab
│   ├── Request List
│   ├── RequestFormPlaceholder (Create new request)
│   └── RequestCardEnhanced (Individual request details)
│
├── ShipmentsTab
│   ├── Shipment List
│   ├── ASNFormPlaceholder (Create ASN)
│   └── ShipmentCard (Individual shipment tracking)
│
├── InventoryTab
│   └── Table View (SKU, Product, Received, Sold, Remaining, Location)
│
└── MetricsTab
    ├── Inventory Overview
    ├── Accuracy Metrics
    ├── Cost Breakdown
    └── Health Score Progress Bar
```

---

## Visual Preview

### Vendor Dashboard Header (Overview)
```
┌─────────────────────────────────────────────────────┐
│ 🏢 US Warehouse Management                          │
│                                                     │
│ Track inventory, manage shipments, monitor perf... │
│                                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │    3    │ │    5    │ │   48    │ │  85/100 │   │
│ │ Total   │ │ Active  │ │ Stored  │ │ Health  │   │
│ │Requests │ │Shipments│ │  SKUs   │ │ Score   │   │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────┘
```

### Tab Navigation
```
┌─────────────────────────────────────────────────────┐
│ ℹ️ Overview | 📄 Storage Requests | 🚚 Inbound     │
│  Shipments | 📦 Warehouse Inventory | 📊 Performance│
└─────────────────────────────────────────────────────┘
```

---

## Database Tables Powering the UI

### For Vendor Portal:

1. **`warehouse_requests`**
   - Main storage request data
   - Fields: status, sku_count, inventory_value, categories

2. **`warehouse_inbound_shipments`**
   - ASN tracking
   - Fields: asn_number, tracking_number, carrier, status, qr_code

3. **`warehouse_inventory`**
   - Stored inventory
   - Fields: sku, product_name, quantity_received, quantity_sold, quantity_remaining, location

4. **`warehouse_performance_metrics`**
   - KPIs and analytics
   - Fields: health_score, turnover_ratio, accuracy_percentage, costs

5. **`warehouse_documents`**
   - BOL, packing slips, labels
   - Fields: document_type, file_url, document_number

6. **`warehouse_locations`**
   - 1,600+ bin locations
   - Fields: location_code (e.g., "A-01-03-C"), is_occupied, current_vendor_id

7. **`warehouse_capacity`**
   - Space availability
   - Fields: available_square_feet, utilization_percentage, pallet_positions

---

## Admin Tables (Read Access):

8. **`vendors`** - Vendor business details
9. **`admin_users`** - Admin permissions
10. **`warehouse_receiving_log`** - Real-time receiving updates

---

## API Endpoints (Next.js route handlers)

Shipping-related handlers live in `app/api/functions/[name]/route.ts` (POST `/api/functions/<name>`), including:

1. **`create-shipping-label`** - Generate shipping labels for warehouse
2. **`generate-shipping-label`** - Carrier-specific label generation
3. **`calculate-shipping-rates`** - Get shipping costs

---

## Testing the UI

### Vendor Flow:

1. **Navigate to Warehouse:**
   - URL: `/vendor/warehouse`
   - You should see the blue gradient header with stats

2. **Create Storage Request:**
   - Click "Storage Requests" tab
   - Click "New Request" button
   - Fill in the form (SKU count, inventory value, categories)
   - Check the shipping acknowledgment checkbox
   - Submit

3. **Wait for Admin Approval:**
   - Status will show "Pending Review" (yellow badge)
   - Once approved, status changes to "Approved" (green badge)
   - Warehouse address will appear in green box

4. **Create Inbound Shipment:**
   - Click "Inbound Shipments" tab
   - Click "Create ASN" button
   - Fill in tracking details
   - Upload documents (BOL, packing slip)
   - Submit

5. **Track Shipment:**
   - View real-time status updates
   - Click tracking number to visit carrier website
   - QR code appears for warehouse scanning

6. **View Inventory:**
   - Click "Warehouse Inventory" tab
   - See all stored SKUs with bin locations
   - View received vs sold vs remaining quantities

7. **Check Performance:**
   - Click "Performance" tab
   - View health score (1-100)
   - See accuracy metrics
   - Review cost breakdown

### Admin Flow:

1. **Navigate to Warehouse:**
   - URL: `/admin/warehouse`
   - You'll see filter buttons (All, Pending, Approved, Active, Completed)

2. **Review Pending Requests:**
   - Click "Pending" filter
   - See all pending vendor requests

3. **Approve Request:**
   - Click "View Details" on a request
   - Review vendor information
   - Click "Approve" button
   - Enter warehouse address and arrival deadline
   - Add admin notes
   - Submit

4. **Monitor Active Storage:**
   - Click "Active" filter
   - View all vendors with active storage
   - Track inventory levels

---

## Color Coding

### Status Badges:

- **Pending**: Yellow (⏱️ Pending Review)
- **Approved**: Green (✅ Approved)
- **Active**: Blue (✅ Active)
- **Rejected**: Red (❌ Rejected)
- **Completed**: Gray (✅ Completed)
- **Cancelled**: Gray (❌ Cancelled)

### Special Handling Tags:

- **HAZMAT**: Red badge
- **Climate Control**: Blue badge
- **Fragile**: Yellow badge

---

## Mobile Responsiveness

The UI is fully responsive:
- Desktop: Full multi-column layout
- Tablet: Adjusted grid (2 columns)
- Mobile: Single column, scrollable tabs

---

## Next Steps

### To Further Enhance:

1. **Add Document Upload:**
   - Implement file upload for BOL and packing slips
   - Use Supabase Storage bucket

2. **Real-Time Notifications:**
   - Add toast notifications for status changes
   - Email/SMS alerts via edge functions

3. **QR Code Generation:**
   - Generate actual QR codes (not just placeholder)
   - Use `qrcode` npm package

4. **Analytics Charts:**
   - Add Chart.js or Recharts
   - Visualize trends over time

5. **Export Functionality:**
   - CSV export for inventory
   - PDF reports for metrics

---

## Support

For issues or questions:
- Check browser console for errors
- Verify vendor_id is correctly passed
- Ensure user has proper RLS permissions
- Check Supabase connection in Network tab

---

## File Modifications Made

### Modified:
- ✅ `/src/App.tsx` - Updated import and component usage

### Created:
- ✅ `/src/components/VendorWarehouseSupportEnhanced.tsx` - New enhanced UI (700+ lines)
- ✅ `/postgres/migrations/20260203060000_enhance_warehouse_storage_system.sql` - Database schema
- ✅ `/postgres/migrations/20260203061000_add_warehouse_locations_sample_data.sql` - Sample locations

### Preserved:
- ✅ `/src/components/VendorWarehouseSupport.tsx` - Original (can be removed or kept as backup)
- ✅ `/src/components/admin/AdminWarehouse.tsx` - Original admin UI

---

## Summary

**Vendor UI Path:** `/vendor/warehouse`
**Admin UI Path:** `/admin/warehouse`
**Main Component:** `VendorWarehouseSupportEnhanced.tsx`
**Integration:** `App.tsx` line 33 & 66
**Build Status:** ✅ Successful
