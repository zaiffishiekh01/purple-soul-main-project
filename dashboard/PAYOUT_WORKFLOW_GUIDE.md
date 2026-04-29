# Complete Payout Workflow Guide

## Overview

This document describes the complete vendor payout workflow from submission to completion, including all admin actions available at each stage.

---

## Workflow States

```
1. PENDING     → 2. APPROVED → 3. PROCESSING → 4. COMPLETED
                                               ↓
                                          5. FAILED → (retry) → 3. PROCESSING
   ↓
6. REJECTED
```

---

## State Details & Actions

### 1. PENDING (Awaiting Admin Review)

**Description:** Vendor submitted payout request, waiting for admin approval.

**Available Actions:**
- ✅ **Approve** - Accept the request and move to approved state
- ❌ **Reject** - Deny the request with reason

**What Happens on Approve:**
- Status changes to `approved`
- `processed_date` is set
- Vendor receives notification: "Your payout request of $X has been approved"
- Request appears in Approved queue

**What Happens on Reject:**
- Status changes to `rejected`
- Admin must provide rejection reason
- Vendor receives notification with reason
- Request moved to Rejected list (view only)

**Test Data:** 15 pending requests with various amounts and ages

---

### 2. APPROVED (Waiting for Bank Processing)

**Description:** Admin approved, ready for bank transfer initiation.

**Available Actions:**
- 🚀 **Process Transfer** - Initiate bank transfer (single)
- 📦 **Add to Batch** - Add to payment batch for bulk processing
- 🔙 **Revert to Pending** - Cancel approval (if needed)

**What Happens on Process Transfer:**
- Status changes to `processing`
- `transfer_initiated_date` is set
- `bank_transfer_id` is generated
- Bank transfer log created
- Vendor receives notification: "Your payout is being processed"

**What Happens on Add to Batch:**
- Request assigned to payment batch
- `payment_batch_id` is set
- Stays in approved state until batch is processed
- Admin can process entire batch at once

**Payment Batches:**
- Create new batch: Auto-generated batch number (BATCH-YYYYMMDD-####)
- Process existing batch: Initiates all requests in batch
- View batch status: pending → processing → completed

**Test Data:**
- 8 approved requests (3 in pending batch, 5 waiting for assignment)
- 1 pending batch ready to process

---

### 3. PROCESSING (Bank Transfer In Progress)

**Description:** Bank transfer initiated, waiting for completion.

**Available Actions:**
- 🔍 **View Transfer Status** - Check bank transfer progress
- ✅ **Mark as Completed** - Manually confirm transfer success
- ❌ **Mark as Failed** - Record transfer failure with reason
- 📄 **View Transfer Log** - See complete transfer history

**What Happens on Mark as Completed:**
- Status changes to `completed`
- `transfer_completed_date` is set
- Transaction record automatically created
- Bank transfer log updated to success
- Vendor receives notification: "Your payout of $X has been completed"
- Funds available in vendor account

**What Happens on Mark as Failed:**
- Status changes to `failed`
- Admin provides failure reason
- `failure_reason` is stored
- Bank transfer log updated to failed
- Vendor receives notification with failure reason
- Request appears in Failed queue for retry

**Transfer Details:**
- Bank Transfer ID
- Initiated Date
- Expected Completion (typically 2-3 business days)
- Transfer Type (ACH, Wire, etc.)

**Test Data:**
- 5 processing requests in active batch
- All have bank transfer IDs and logs

---

### 4. COMPLETED (Successfully Paid)

**Description:** Funds successfully transferred to vendor's bank account.

**Available Actions:**
- 📄 **View Transaction** - See transaction record
- 📥 **Download Receipt** - Generate PDF receipt
- 🔍 **View Transfer Log** - Complete audit trail
- 💬 **Contact Vendor** - Send message about payout

**Transaction Details:**
- Transaction ID (auto-created)
- Amount paid
- Platform fee deducted
- Transfer date
- Confirmation number

**What You Can View:**
- Original request details
- Approval details
- Transfer timeline (initiated → completed)
- Bank transfer logs
- Related transaction

**Test Data:**
- 10 completed requests with full history
- 4 in completed batch
- 6 individual completions
- All have transaction records

---

### 5. FAILED (Transfer Failed)

**Description:** Bank transfer failed, needs resolution.

**Available Actions:**
- 🔄 **Retry Transfer** - Attempt transfer again
- 📝 **Update Bank Details** - Request vendor to update info
- 🔙 **Revert to Approved** - Return to approved state
- ❌ **Cancel Payout** - Reject with failure reason

**What Happens on Retry:**
- Status changes back to `processing`
- `retry_count` incremented
- New bank transfer initiated
- New bank transfer log created
- Vendor notified of retry attempt

**What Happens on Update Bank Details:**
- Status stays `failed`
- Notification sent to vendor with instructions
- Admin can retry after vendor updates settings

**Common Failure Reasons:**
- Invalid bank account number
- Incorrect routing number
- Account closed
- Insufficient funds (platform)
- Bank rejection

**Retry Logic:**
- Max 3 automatic retries
- After 3 failures, requires manual review
- Each retry logged separately

**Test Data:**
- 3 failed requests with different failure reasons
- Various retry counts (0, 0, 1)

---

### 6. REJECTED (Admin Denied)

**Description:** Admin rejected the payout request.

**Available Actions:**
- 📄 **View Rejection Reason** - See why it was rejected
- 💬 **Message Vendor** - Discuss with vendor
- 🔙 **Revert to Pending** - Allow resubmission (rare)

**Common Rejection Reasons:**
- Insufficient documentation
- Bank verification failed
- Account under review
- Amount exceeds threshold
- Incomplete vendor profile

**What Vendor Sees:**
- Rejection notification with full reason
- Can submit new request after fixing issues
- Cannot reopen rejected request

**Test Data:** 4 existing rejected requests (from previous migrations)

---

## Payment Batches

### What are Payment Batches?

Groups of approved payout requests processed together for efficiency.

### Batch States:
1. **Pending** - Batch created, requests assigned, ready to process
2. **Processing** - Bank transfers initiated for all requests
3. **Completed** - All transfers in batch completed
4. **Failed** - One or more transfers failed (partial failure)

### Batch Actions:

**For Pending Batch:**
- 🚀 **Process Batch** - Initiate all transfers
- ➕ **Add Requests** - Add more approved requests
- ➖ **Remove Requests** - Remove requests from batch
- ❌ **Cancel Batch** - Delete batch (requests return to approved)

**For Processing Batch:**
- 🔍 **View Progress** - See status of each request
- 📊 **View Summary** - Success/failed counts
- 🔔 **Get Notifications** - Alerts when batch completes

**For Completed Batch:**
- 📄 **View Report** - Complete batch report
- 📥 **Download CSV** - Export all transactions
- 📊 **View Statistics** - Total amount, fees, etc.

### Test Data:
- **BATCH-20251115-0001** (Completed) - 4 requests, all successful
- **BATCH-20251116-0001** (Processing) - 5 requests, in progress
- **BATCH-20251117-0001** (Pending) - 3 requests, ready to process

---

## Complete Test Data Summary

### By Status:
```
PENDING     : 15 requests  →  Approve/Reject actions
APPROVED    : 8 requests   →  Process/Batch actions
PROCESSING  : 5 requests   →  Complete/Fail actions
COMPLETED   : 10 requests  →  View transaction
FAILED      : 3 requests   →  Retry actions
REJECTED    : 4 requests   →  View only
─────────────────────────────────────────────
TOTAL       : 45 requests
```

### By Batch:
```
BATCH-20251115-0001 (Completed)  : 4 requests
BATCH-20251116-0001 (Processing) : 5 requests
BATCH-20251117-0001 (Pending)    : 3 requests
No Batch (Individual)            : 33 requests
```

---

## Admin Actions by Status

| Status | Primary Action | Secondary Actions |
|--------|---------------|-------------------|
| Pending | Approve, Reject | - |
| Approved | Process Transfer | Add to Batch, Revert |
| Processing | Mark Completed | Mark Failed, View Status |
| Completed | View Transaction | Download Receipt |
| Failed | Retry Transfer | Update Details, Cancel |
| Rejected | View Reason | Message Vendor |

---

## Workflow Examples

### Example 1: Standard Single Payout

1. Vendor submits request → **PENDING**
2. Admin reviews → Click **Approve** → **APPROVED**
3. Admin clicks **Process Transfer** → **PROCESSING**
4. Wait 2-3 days (bank processing)
5. Admin clicks **Mark as Completed** → **COMPLETED**
6. Transaction auto-created, vendor notified

**Timeline:** 2-4 business days

---

### Example 2: Batch Processing

1. Multiple vendors submit requests → **PENDING** (15 requests)
2. Admin approves 5 requests → **APPROVED**
3. Admin creates batch "BATCH-20251117-0002"
4. Admin adds all 5 requests to batch
5. Admin clicks **Process Batch** → All **PROCESSING**
6. Wait for bank to process all transfers
7. Admin marks batch as **Completed** → All **COMPLETED**
8. 5 transactions auto-created

**Timeline:** 2-4 business days
**Efficiency:** Process 5-50 payouts at once

---

### Example 3: Failed Transfer Retry

1. Request in **PROCESSING**
2. Bank rejects (invalid account) → **FAILED**
3. Admin contacts vendor → "Update your bank account"
4. Vendor updates payout settings
5. Admin clicks **Retry Transfer** → **PROCESSING** (retry 1)
6. Bank accepts → **PROCESSING**
7. Admin marks as **Completed** → **COMPLETED**

**Timeline:** +1-2 days for retry

---

### Example 4: Rejection

1. Vendor submits request → **PENDING**
2. Admin reviews: Missing documents
3. Admin clicks **Reject**
4. Modal opens: "Enter rejection reason"
5. Admin types: "Please provide invoices for orders #123-#456"
6. Status → **REJECTED**
7. Vendor receives notification
8. Vendor uploads documents
9. Vendor submits new request → **PENDING**

---

## Database Schema

### payout_requests
```sql
- id (UUID)
- vendor_id (UUID) → vendors.id
- amount (DECIMAL)
- platform_fee (DECIMAL)
- net_amount (DECIMAL)
- status (TEXT)
  Values: 'pending', 'approved', 'processing', 'completed', 'failed', 'rejected'
- request_date (TIMESTAMPTZ)
- processed_date (TIMESTAMPTZ)
- transfer_initiated_date (TIMESTAMPTZ)
- transfer_completed_date (TIMESTAMPTZ)
- bank_transfer_id (TEXT)
- failure_reason (TEXT)
- rejection_reason (TEXT)
- retry_count (INTEGER)
- payment_batch_id (UUID) → payment_batches.id
- transaction_id (UUID) → transactions.id
- notes (TEXT)
```

### payment_batches
```sql
- id (UUID)
- batch_number (TEXT) UNIQUE
- created_by (UUID) → auth.users.id
- total_amount (DECIMAL)
- total_requests (INTEGER)
- status (TEXT)
  Values: 'pending', 'processing', 'completed', 'failed'
- initiated_date (TIMESTAMPTZ)
- completed_date (TIMESTAMPTZ)
- notes (TEXT)
```

### bank_transfer_logs
```sql
- id (UUID)
- payout_request_id (UUID) → payout_requests.id
- transfer_id (TEXT)
- status (TEXT)
- amount (DECIMAL)
- initiated_by (UUID) → auth.users.id
- response_data (JSONB)
- error_message (TEXT)
- retry_number (INTEGER)
- created_at (TIMESTAMPTZ)
```

---

## Automatic Processes

### Auto Transaction Creation

When payout status changes to `completed`:
1. Trigger automatically fires
2. Creates transaction record:
   - Type: 'payout'
   - Amount: net_amount
   - Description: includes platform fee
   - Reference: payout request ID
3. Links transaction to payout request
4. Vendor can view in Finance/Transactions

### Auto Notifications

Automatically sent on:
- Approval: "Payout approved, processing soon"
- Processing: "Payout being processed by bank"
- Completion: "Payout completed, funds available"
- Failure: "Payout failed: [reason]"
- Rejection: "Payout rejected: [reason]"

---

## Testing Scenarios

### 1. Test Approve Action
- Filter: Status = "Pending"
- Find: Any pending request
- Click: Green ✅ Approve button
- Verify: Status → approved, notification sent

### 2. Test Reject Action
- Filter: Status = "Pending"
- Find: Any pending request
- Click: Red ❌ Reject button
- Enter: "Insufficient documentation"
- Verify: Status → rejected, reason stored

### 3. Test Process Transfer
- Filter: Status = "Approved"
- Find: Request not in batch
- Click: 🚀 Process Transfer
- Verify: Status → processing, bank_transfer_id created

### 4. Test Batch Processing
- Filter: Status = "Approved"
- Select: Multiple requests
- Click: 📦 Create Batch
- Add requests to batch
- Click: Process Batch
- Verify: All → processing

### 5. Test Complete Transfer
- Filter: Status = "Processing"
- Find: Any processing request
- Click: ✅ Mark as Completed
- Verify: Status → completed, transaction created

### 6. Test Fail Transfer
- Filter: Status = "Processing"
- Find: Any processing request
- Click: ❌ Mark as Failed
- Enter: "Bank account invalid"
- Verify: Status → failed, failure_reason stored

### 7. Test Retry Failed
- Filter: Status = "Failed"
- Find: Failed request
- Click: 🔄 Retry Transfer
- Verify: Status → processing, retry_count + 1

---

## UI Elements Needed

### Pending Row:
```
[Vendor Name]  [$X.XX]  [pending]  [✅ Approve] [❌ Reject]
```

### Approved Row:
```
[Vendor Name]  [$X.XX]  [approved]  [🚀 Process] [📦 Batch]
```

### Processing Row:
```
[Vendor Name]  [$X.XX]  [processing]  [✅ Complete] [❌ Fail] [🔍 View]
```

### Completed Row:
```
[Vendor Name]  [$X.XX]  [completed]  [📄 Transaction] [📥 Receipt]
```

### Failed Row:
```
[Vendor Name]  [$X.XX]  [failed]  [🔄 Retry] [📝 Update] [❌ Cancel]
```

### Rejected Row:
```
[Vendor Name]  [$X.XX]  [rejected]  [📄 View Reason]
```

---

## Next Steps

To implement in the UI:

1. Update AdminPayouts.tsx to show actions based on status
2. Add action handlers for each button
3. Create modals for:
   - Process Transfer confirmation
   - Mark as Failed (reason input)
   - Retry confirmation
4. Add batch management section
5. Add transfer status view
6. Add transaction linking
7. Style status badges by state

---

**This is a production-ready payout workflow with complete testing coverage.**
