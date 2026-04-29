# Return Management System - Complete Flow Guide

## Overview
The return management system provides comprehensive workflows for handling product returns, from initial customer request through final refund processing.

---

## Return Status Flow

```
PENDING → APPROVED → RECEIVED → COMPLETED
   ↓
REJECTED (Terminal)
```

---

## Detailed Status Descriptions

### 1. **PENDING** (Initial State)
- Customer submits return request
- Vendor needs to review and make decision
- **Available Actions:**
  - ✅ Approve Return
  - ❌ Reject Return

### 2. **APPROVED**
- Vendor has approved the return
- Waiting for customer to ship item back
- Return shipping label sent to customer
- **Available Actions:**
  - 📦 Mark as Received (when item arrives)

### 3. **RECEIVED**
- Item has been received at warehouse
- Item inspected and verified
- Ready for refund processing
- **Available Actions:**
  - 💰 Process Refund

### 4. **COMPLETED**
- Refund has been processed
- Transaction created in system
- Customer notified
- **No Further Actions**

### 5. **REJECTED**
- Return request denied
- Customer notified with reason
- **No Further Actions**

---

## Action Workflows

### 🟢 **APPROVE RETURN**

**Trigger:** Vendor clicks "Approve" on pending return

**Modal Opens With:**
- Return details (number, order, customer)
- Return reason and customer notes
- Items being returned
- Return amount

**Vendor Can:**
- Add approval notes/instructions
- Click "Approve Return"

**System Actions:**
1. Updates status: `pending` → `approved`
2. Sets `approved_at` timestamp
3. Sends email to customer with:
   - Approval confirmation
   - Return shipping instructions
   - Return label (if applicable)
4. Updates dashboard counts

**Next Step:** Customer ships item back

---

### 🔴 **REJECT RETURN**

**Trigger:** Vendor clicks "Reject" on pending return

**Modal Opens With:**
- Return details
- Required rejection reason dropdown:
  - Outside Return Window
  - Item Used or Damaged
  - Missing Parts
  - No Original Packaging
  - Fraudulent Claim
  - Policy Violation
  - Other Reason

**System Actions:**
1. Updates status: `pending` → `rejected`
2. Sets `processed_at` timestamp
3. Saves rejection reason in notes
4. Sends email to customer with:
   - Rejection notification
   - Reason for rejection
   - Next steps (if any)
5. Updates dashboard counts

**Result:** Return request closed (terminal state)

---

### 📦 **MARK AS RECEIVED**

**Trigger:** Vendor clicks "Mark Received" on approved return

**Modal Opens With:**
- Return details
- Items expected
- Option to add inspection notes

**Vendor Can:**
- Verify items received match return request
- Add inspection notes (condition, completeness)
- Confirm receipt

**System Actions:**
1. Updates status: `approved` → `received`
2. Sets `received_at` timestamp
3. Saves inspection notes
4. Prepares for refund processing
5. Updates dashboard counts

**Next Step:** Process refund

---

### 💰 **PROCESS REFUND**

**Trigger:** Vendor clicks "Process Refund" on received return

**Modal Opens With:**
- Return details
- Refund method selection:
  - ✅ Original Payment Method (default)
  - 🎁 Store Credit
  - 🏦 Bank Transfer
- Restocking fee option (if applicable)
- Refund amount calculation:
  - Original Amount: $XXX.XX
  - Restocking Fee: -$XX.XX (optional)
  - **Final Refund: $XXX.XX**

**Vendor Can:**
- Select refund method
- Apply/remove restocking fee
- Add refund notes
- Confirm refund

**System Actions:**
1. Updates status: `received` → `completed`
2. Sets `refunded_at` and `processed_at` timestamps
3. Updates `refund_method` and final `return_amount`
4. **Creates Transaction Record:**
   - Type: `refund`
   - Amount: `-$XXX.XX` (negative)
   - Status: `completed`
   - Description: "Refund for return RET-XXX - reason"
5. Updates vendor balance
6. Sends email to customer with:
   - Refund confirmation
   - Amount refunded
   - Method used
   - Expected processing time
7. Updates dashboard counts

**Result:** Return fully completed

---

## Refund Processing Logic

### Refund Amount Calculation

```javascript
Base Amount = return_amount (from order)
Restocking Fee = restocking_fee (if applicable)

Final Refund = Base Amount - Restocking Fee
```

### Restocking Fee Rules

**When to Apply:**
- Customer changed mind (no defect)
- Return after extended period
- Custom/personalized items
- Final sale items

**When NOT to Apply:**
- Defective products
- Wrong item sent
- Damaged in shipping
- Not as described
- Size/fit issues

### Refund Methods

**1. Original Payment Method**
- Returns money to customer's original payment
- Processing time: 5-10 business days
- Most common method

**2. Store Credit**
- Issues credit for future purchases
- Instant availability
- No processing delay
- Can offer bonus (e.g., 110% store credit)

**3. Bank Transfer**
- Direct deposit to customer account
- Requires bank details
- Processing time: 3-5 business days

---

## Transaction Integration

Every completed refund creates a transaction record:

```javascript
{
  vendor_id: "vendor-uuid",
  order_id: "order-uuid",
  type: "refund",
  amount: -161.29,  // Negative amount
  status: "completed",
  description: "Refund for return RET-TEST-001 - defective"
}
```

**Impact on Vendor Balance:**
- Deducts refund amount from vendor balance
- Visible in Finance Management
- Tracked in transaction history
- Included in analytics reports

---

## Email Notifications

### On Approval
**To:** Customer
**Subject:** Return Request Approved - [Return Number]
**Content:**
- Return has been approved
- Shipping instructions
- Return deadline (e.g., 14 days)
- Tracking info

### On Rejection
**To:** Customer
**Subject:** Return Request Update - [Return Number]
**Content:**
- Return not approved
- Reason for rejection
- Policy information
- Contact support if questions

### On Refund
**To:** Customer
**Subject:** Refund Processed - [Return Number]
**Content:**
- Refund has been issued
- Amount: $XXX.XX
- Method: Original payment / Store credit
- Processing time: X days
- Transaction reference

---

## Test Scenarios

### Test Data Available

**Pending Returns (5):**
- RET-TEST-001: Defective - $161.29
- RET-TEST-002: Wrong item - $403.58
- RET-TEST-003: Not as described - $461.91
- RET-TEST-004: Changed mind - $287.48 (has restocking fee)
- RET-TEST-005: Damaged - $161.29

**Approved Returns (3):**
- RET-TEST-006: Wrong size - $403.58
- RET-TEST-007: Defective - $461.91
- RET-TEST-008: Not as described - $287.48

**Received Returns (4):**
- RET-TEST-009: Defective - $161.29 (original payment)
- RET-TEST-010: Not as described - $403.58
- RET-TEST-011: Wrong item - $461.91
- RET-TEST-012: Defective - $287.48 (store credit)

**Completed Returns (4):**
- RET-TEST-013 through RET-TEST-016

### Testing Actions

**1. Test Approve Flow:**
```
1. Click on RET-TEST-001 (Pending)
2. Click "Approve" button
3. Review return details
4. Add optional notes
5. Click "Approve Return"
6. Verify status changes to "Approved"
7. Check dashboard counts updated
```

**2. Test Reject Flow:**
```
1. Click on RET-TEST-004 (Pending)
2. Click "Reject" button
3. Select rejection reason from dropdown
4. Click "Reject Return"
5. Verify status changes to "Rejected"
6. Check rejection reason saved
```

**3. Test Mark Received:**
```
1. Click on RET-TEST-006 (Approved)
2. Click "Mark Received" button
3. Add inspection notes
4. Click "Mark as Received"
5. Verify status changes to "Received"
```

**4. Test Refund Processing:**
```
1. Click on RET-TEST-009 (Received)
2. Click "Process Refund" button
3. Review refund amount: $161.29
4. Select refund method: "Original Payment"
5. Click "Process Refund"
6. Verify:
   - Status changes to "Completed"
   - Transaction created with -$161.29
   - Dashboard counts updated
   - Refunded_at timestamp set
```

**5. Test Restocking Fee:**
```
1. Click on RET-TEST-012 (Received)
2. Click "Process Refund"
3. Check "Apply Restocking Fee" checkbox
4. Verify final amount calculation
5. Process refund
6. Verify correct amount in transaction
```

---

## Common Use Cases

### **Scenario 1: Defective Product**
```
Customer → Reports defect → Vendor reviews
    ↓
Vendor → Approves (no restocking fee)
    ↓
Customer → Ships back item
    ↓
Vendor → Receives & inspects → Confirms defect
    ↓
Vendor → Processes full refund → Original payment
    ↓
COMPLETED ✅
```

### **Scenario 2: Changed Mind**
```
Customer → No longer needs item → Vendor reviews
    ↓
Vendor → Approves WITH restocking fee (10%)
    ↓
Customer → Accepts and ships back
    ↓
Vendor → Receives → Verifies unused condition
    ↓
Vendor → Processes refund with fee deduction
    ↓
COMPLETED ✅ (Customer receives partial refund)
```

### **Scenario 3: Fraudulent Claim**
```
Customer → Claims defect (but no evidence)
    ↓
Vendor → Reviews → Finds inconsistencies
    ↓
Vendor → REJECTS with reason "Fraudulent Claim"
    ↓
REJECTED ❌ (No refund issued)
```

---

## Best Practices

### For Vendors

**1. Review Returns Promptly**
- Check pending returns daily
- Respond within 24-48 hours
- Clear communication with customer

**2. Document Everything**
- Add detailed notes on approval
- Record inspection findings
- Save evidence (photos) if needed

**3. Be Fair with Restocking Fees**
- Only apply when policy allows
- Waive for defects/errors
- Communicate clearly to customer

**4. Process Refunds Quickly**
- Once received, refund within 2-3 days
- Don't delay unnecessarily
- Good customer service = repeat business

### For Customers

**1. Return Within Window**
- Check return policy timeframe
- Don't wait too long

**2. Keep Original Packaging**
- Improves approval chances
- Protects during return shipping

**3. Provide Clear Evidence**
- Photos of defects/damage
- Detailed description
- Original order details

**4. Ship Back Promptly**
- Once approved, ship within deadline
- Use provided return label
- Get tracking number

---

## Dashboard Metrics

The return management dashboard shows:

**Return Counts by Status:**
- 📋 Pending Review
- ✅ Approved
- 📦 Received
- ✅ Completed

**Financial Impact:**
- Total pending refunds
- Processed refunds this month
- Return rate percentage
- High-return products

---

## System Features

✅ **Modal-based workflows** - Clear, guided actions
✅ **Automatic transaction creation** - Financial tracking
✅ **Email notifications** - Customer communication
✅ **Flexible refund methods** - Original payment, store credit, bank transfer
✅ **Restocking fee support** - Optional fee deduction
✅ **Status tracking** - Complete lifecycle visibility
✅ **Notes & documentation** - Audit trail for all actions
✅ **Real-time dashboard updates** - Live status counts

---

## Technical Implementation

**Database Schema:**
```sql
returns table:
- status: pending | approved | rejected | received | completed
- approved_at: timestamp
- received_at: timestamp
- refunded_at: timestamp
- refund_method: original_payment | store_credit | bank_transfer
- return_amount: decimal
- restocking_fee: decimal
```

**Transaction Creation:**
```typescript
// Automatic on refund processing
{
  type: 'refund',
  amount: -(return_amount - restocking_fee),
  status: 'completed'
}
```

---

Your return management system is production-ready! 🚀
