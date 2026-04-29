# Privacy-Protected Vendor-Customer Messaging System

## Overview

Complete privacy protection system where customer email and phone numbers are MASKED from vendors. All vendor-customer communication requires admin approval and goes through the platform's secure messaging system.

---

## Key Privacy Features

1. **Customer Data Masking**: Vendors NEVER see customer email or phone
2. **Admin Approval Required**: Vendors must request permission to contact customers
3. **Platform Messaging Only**: All communication happens in-app (no direct email/phone)
4. **Customer Consent**: Customers must accept after admin approves
5. **Audit Trail**: All contact requests logged for compliance

---

## Database Schema

### New Tables Created

#### 1. `contact_requests`
Vendors request admin permission to contact customers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `vendor_id` | uuid | Vendor making request |
| `customer_id` | uuid | Customer to contact |
| `order_id` | uuid | Related order (optional) |
| `product_id` | uuid | Related product (optional) |
| `reason_category` | enum | order_inquiry, shipping_issue, product_question, return_assistance, custom_order, other |
| `reason_text` | text | Detailed explanation (20-1000 chars) |
| `status` | enum | pending, approved, rejected, customer_declined |
| `reviewed_by_admin_id` | uuid | Admin who reviewed |
| `reviewed_at` | timestamptz | Review timestamp |
| `admin_notes` | text | Internal admin notes |
| `customer_accepted` | boolean | Customer acceptance |
| `customer_accepted_at` | timestamptz | Acceptance timestamp |

**Indexes:**
- `idx_contact_requests_vendor` on vendor_id
- `idx_contact_requests_customer` on customer_id
- `idx_contact_requests_order` on order_id
- `idx_contact_requests_status` on status
- `idx_contact_requests_pending` on status WHERE status='pending'

---

#### 2. `message_threads`
Conversation threads between vendors and customers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `vendor_id` | uuid | Vendor participant |
| `customer_id` | uuid | Customer participant |
| `order_id` | uuid | Related order |
| `contact_request_id` | uuid | Original contact request |
| `subject` | text | Thread subject |
| `status` | enum | active, archived, blocked |
| `last_message_at` | timestamptz | Last message time |
| `last_message_by` | enum | customer, vendor, admin |
| `vendor_unread_count` | int | Unread by vendor |
| `customer_unread_count` | int | Unread by customer |
| `vendor_archived` | boolean | Vendor archived |
| `customer_archived` | boolean | Customer archived |

**Indexes:**
- `idx_message_threads_vendor` on vendor_id
- `idx_message_threads_customer` on customer_id
- `idx_message_threads_order` on order_id
- `idx_message_threads_last_message` on last_message_at DESC

---

#### 3. `vendor_customer_messages`
Individual messages in threads.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `thread_id` | uuid | Parent thread |
| `sender_type` | enum | customer, vendor, admin |
| `sender_id` | uuid | User who sent |
| `message_text` | text | Message content (1-5000 chars) |
| `attachments` | jsonb | File URLs |
| `is_read` | boolean | Read status |
| `read_at` | timestamptz | Read timestamp |
| `parent_message_id` | uuid | Reply to message |
| `is_flagged` | boolean | Admin flagged |
| `flagged_reason` | text | Flag reason |

**Indexes:**
- `idx_vendor_customer_messages_thread` on thread_id
- `idx_vendor_customer_messages_sender` on sender_id
- `idx_vendor_customer_messages_created` on created_at DESC
- `idx_vendor_customer_messages_unread` on is_read WHERE is_read=false

---

### Database View: `vendor_order_view`

**Masked order data for vendors:**

```sql
CREATE OR REPLACE VIEW vendor_order_view AS
SELECT
  o.id,
  o.order_number,
  o.status,
  o.created_at,

  -- MASKED customer info
  'Customer #' || SUBSTRING(o.customer_id::text, 1, 8) as customer_display_name,
  o.customer_id,

  -- MASKED shipping address (city/state/country only)
  jsonb_build_object(
    'city', o.shipping_address->>'city',
    'state_province', o.shipping_address->>'state_province',
    'country', o.shipping_address->>'country',
    'postal_code', o.shipping_address->>'postal_code'
  ) as shipping_address_summary,

  -- Full address ONLY after contact approved
  CASE
    WHEN EXISTS (
      SELECT 1 FROM contact_requests cr
      WHERE cr.order_id = o.id
      AND cr.status = 'approved'
      AND cr.customer_accepted = true
    ) THEN o.shipping_address
    ELSE NULL
  END as shipping_address_full,

  -- Contact info ONLY after contact approved
  CASE
    WHEN EXISTS (
      SELECT 1 FROM contact_requests cr
      WHERE cr.order_id = o.id
      AND cr.status = 'approved'
      AND cr.customer_accepted = true
    ) THEN o.contact_info
    ELSE jsonb_build_object(
      'email', 'Use platform messaging',
      'phone', 'Use platform messaging'
    )
  END as contact_info_masked,

  o.subtotal,
  o.tax,
  o.shipping_cost,
  o.total
FROM orders o;
```

---

## Complete Workflow

### Step 1: Vendor Sees Masked Customer Data

When viewing an order at `/vendor/orders/[orderId]`:

**Vendor sees:**
```
Customer ID: Customer #a1b2c3d4...
Contact: Use platform messaging
Shipping: City, State, Country (NO street address, NO name)
```

**Vendor does NOT see:**
- Customer email
- Customer phone
- Customer full name
- Street address
- Apartment/unit number

---

### Step 2: Vendor Requests Contact

Vendor clicks **"Request Customer Contact"** button:

**Modal opens with form:**
1. Reason Category (dropdown):
   - Order Inquiry
   - Shipping Issue
   - Product Question
   - Return Assistance
   - Custom Order Request
   - Other

2. Detailed Reason (textarea):
   - Minimum 20 characters
   - Maximum 1000 characters
   - Must explain WHY they need to contact customer

**Validation:**
- Category required
- Reason text required
- Length validation
- One request per order (prevents spam)

**API Endpoint:** `POST /api/vendor/contact-request`

**Request body:**
```json
{
  "customer_id": "uuid",
  "order_id": "uuid",
  "reason_category": "order_inquiry",
  "reason_text": "Customer ordered custom embroidery. Need to confirm thread colors and placement before production."
}
```

**Response:**
```json
{
  "success": true,
  "contact_request": {...},
  "message": "Contact request submitted. Admin will review and notify you."
}
```

**Status created:** `pending`

---

### Step 3: Admin Reviews Request

Admin visits `/admin/contact-requests`:

**Admin sees:**
- All pending requests
- Vendor name, email, logo
- Customer name, email
- Order details (number, total, status)
- Reason category and full explanation
- Request timestamp

**Admin can:**
1. **Approve** → Creates message thread, notifies customer
2. **Reject** → Notifies vendor, request denied
3. Add admin notes (internal only)

**Tabs:**
- Pending Review (requires action)
- Approved (contact granted)
- Rejected (contact denied)
- All Requests (full history)

**API Endpoint:** `PATCH /api/admin/contact-requests`

**Request body:**
```json
{
  "request_id": "uuid",
  "action": "approve",
  "admin_notes": "Legitimate custom order inquiry. Approved."
}
```

**On Approval:**
1. `contact_requests.status` → `'approved'`
2. `contact_requests.reviewed_by_admin_id` → admin user ID
3. `contact_requests.reviewed_at` → now()
4. Create `message_thread` record
5. Send notification to customer (future: email/push)

**On Rejection:**
1. `contact_requests.status` → `'rejected'`
2. Send notification to vendor

---

### Step 4: Customer Accepts/Declines

Customer receives notification: "Vendor [Business Name] has requested to contact you about Order #12345"

**Customer options:**
1. **Accept** → Can now message vendor
   - `contact_requests.customer_accepted` → `true`
   - `contact_requests.customer_accepted_at` → now()
   - Thread becomes active
   - Customer can send/receive messages

2. **Decline** → Contact request denied
   - `contact_requests.status` → `'customer_declined'`
   - Thread archived
   - Vendor notified

---

### Step 5: Platform Messaging

Once approved AND accepted:

**Vendor sees in order details:**
```
✓ Contact Approved
Email: customer@example.com
Phone: +1-555-0123
[Send Message] button enabled
```

**Full shipping address revealed:**
```
John Smith
123 Main Street, Apt 4B
New York, NY 10001
United States
```

**Messaging Interface:**

Both vendor and customer can:
- View message history
- Send new messages (1-5000 chars)
- Attach files (images, documents)
- Mark messages as read
- Archive conversations

**Message Thread Features:**
- Real-time unread count
- Last message timestamp
- Participant info
- Order context
- Subject line

**API Endpoints:**

**Get Threads:** `GET /api/messages`
- Returns all threads for current user
- Shows vendor OR customer threads based on role

**Send Message:** `POST /api/messages`
```json
{
  "thread_id": "uuid",
  "message_text": "Your custom embroidery is ready for review...",
  "attachments": ["https://..."]
}
```

**Auto-updates:**
- `message_threads.last_message_at` updated
- `message_threads.last_message_by` updated
- Unread count incremented for recipient
- Database trigger handles this automatically

---

## Row-Level Security (RLS) Policies

### contact_requests

**Vendors:**
- Can view their own requests: `vendor_id = current_vendor`
- Can create requests: `vendor_id = current_vendor`

**Customers:**
- Can view requests about them: `customer_id = auth.uid()`
- Can update acceptance: `customer_id = auth.uid()`

**Admins:**
- Can view all requests
- Can approve/reject requests
- Can add admin notes

### message_threads

**Vendors:**
- Can view threads they're in: `vendor_id = current_vendor`
- Can update metadata (archive, unread count)

**Customers:**
- Can view threads they're in: `customer_id = auth.uid()`
- Can update metadata (archive, unread count)

**Admins:**
- Can create threads (after approval)
- Can view all threads

### vendor_customer_messages

**Participants:**
- Can view messages in their threads
- Can send messages in active threads
- Can mark messages as read

**Admins:**
- Can view all messages
- Can flag inappropriate messages
- Can moderate content

---

## UI Components

### Vendor Components

#### 1. Request Contact Modal
**File:** `/components/vendor/request-contact-modal.tsx`

**Features:**
- Category dropdown
- Reason textarea with character counter
- Validation feedback
- Loading state
- Success/error toasts

#### 2. Vendor Order Detail Page (Updated)
**File:** `/app/vendor/orders/[orderId]/page.tsx`

**Changes:**
- Shows masked customer info by default
- "Request Customer Contact" button
- Contact request status badge
- Full info revealed after approval
- Messaging button when approved

### Admin Components

#### Admin Contact Requests Page
**File:** `/app/admin/contact-requests/page.tsx`

**Features:**
- Tabbed interface (Pending, Approved, Rejected, All)
- Request cards with full context
- Approve/Reject actions
- Admin notes field
- Review modal
- Status badges

### Customer Components (Future)

**Notifications Page:**
- Contact request notifications
- Accept/Decline actions
- View vendor details

**Messages Inbox:**
- Thread list
- Message history
- Reply interface
- Attachment support

---

## Security Features

### 1. Data Masking
- Customer email/phone NEVER in vendor API responses
- Street address hidden until approved
- Customer name replaced with "Customer #[ID]"

### 2. Admin Oversight
- Every contact request reviewed by human
- Admin can reject suspicious requests
- Internal notes for tracking

### 3. Customer Consent
- Two-step approval (admin + customer)
- Customer can decline even if admin approves
- Customer maintains control

### 4. Audit Trail
- All requests logged with timestamps
- Admin who approved recorded
- Reason for contact documented
- Cannot be deleted (soft delete only)

### 5. Platform Containment
- All messages stored in database
- No direct email/phone communication
- Platform can moderate/flag messages
- Compliance with regulations (GDPR, CCPA)

---

## API Routes

### Vendor Endpoints

**POST /api/vendor/contact-request**
- Create contact request
- Validates reason length
- Checks for duplicates
- Returns request ID

**GET /api/vendor/contact-request**
- List vendor's contact requests
- Shows status and admin notes
- Includes order/product context

### Admin Endpoints

**GET /api/admin/contact-requests?status=pending**
- List contact requests by status
- Full vendor and customer details
- Includes order context

**PATCH /api/admin/contact-requests**
- Approve or reject request
- Add admin notes
- Create message thread on approval

### Messaging Endpoints

**GET /api/messages**
- List threads for current user
- Role-based filtering
- Includes unread counts

**POST /api/messages**
- Send message in thread
- Validates thread participation
- Auto-updates thread metadata

**POST /api/messages/[threadId]/read**
- Mark all messages as read
- Updates unread count
- Returns updated thread

---

## Database Functions

### update_thread_last_message()
**Trigger:** AFTER INSERT on vendor_customer_messages

Updates thread metadata when new message sent:
```sql
UPDATE message_threads SET
  last_message_at = NEW.created_at,
  last_message_by = NEW.sender_type,
  vendor_unread_count = CASE WHEN sender != vendor THEN +1 ELSE same END,
  customer_unread_count = CASE WHEN sender != customer THEN +1 ELSE same END
```

### mark_thread_messages_read(thread_id, reader_type)
**Usage:** Called when user opens thread

Marks all messages as read and resets unread count:
```sql
UPDATE vendor_customer_messages SET is_read = true
WHERE thread_id = p_thread_id AND sender_type != p_reader_type

UPDATE message_threads SET [reader]_unread_count = 0
```

---

## Testing Checklist

### Vendor Flow
- [ ] Vendor views order with masked customer data
- [ ] Vendor can request contact
- [ ] Form validation works (min 20 chars)
- [ ] Duplicate request prevented
- [ ] Status badge shows "Pending"
- [ ] Cannot see full address/email

### Admin Flow
- [ ] Admin sees pending requests
- [ ] All context visible (vendor, customer, order)
- [ ] Can approve with notes
- [ ] Can reject with notes
- [ ] Message thread created on approval
- [ ] Tabs filter correctly

### Customer Flow
- [ ] Customer receives notification (when implemented)
- [ ] Customer can accept request
- [ ] Customer can decline request
- [ ] Declining blocks vendor access

### Messaging Flow
- [ ] Thread created after approval + acceptance
- [ ] Vendor can send messages
- [ ] Customer can send messages
- [ ] Unread counts update
- [ ] Messages display chronologically
- [ ] Attachments work (when implemented)

### Privacy Checks
- [ ] Customer email NEVER in vendor API
- [ ] Customer phone NEVER in vendor API
- [ ] Street address hidden until approved
- [ ] Name masked as "Customer #..."
- [ ] Full data only after approval + acceptance
- [ ] Audit logs complete

---

## Environment Variables

No additional environment variables required. Uses existing Supabase setup.

---

## Future Enhancements

### Phase 1 (Current)
- [x] Contact request system
- [x] Admin approval workflow
- [x] Data masking
- [x] Basic messaging tables

### Phase 2 (Next)
- [ ] Customer notification system
- [ ] Email notifications (new request, approved, etc.)
- [ ] Push notifications
- [ ] Customer accept/decline UI
- [ ] Full messaging UI (inbox, threads, chat)

### Phase 3 (Future)
- [ ] Attachment upload/storage
- [ ] Message search
- [ ] Canned responses for vendors
- [ ] Auto-responder for common questions
- [ ] Message templates
- [ ] Multi-language support

### Phase 4 (Advanced)
- [ ] AI moderation for inappropriate content
- [ ] Sentiment analysis
- [ ] Auto-translate messages
- [ ] Video call integration
- [ ] Screen sharing for custom orders

---

## Compliance Notes

### GDPR Compliance
- Customer data minimization
- Purpose limitation (contact only with reason)
- Right to decline contact
- Audit trail for data access
- Customer can request data deletion

### CCPA Compliance
- Transparent about data usage
- Customer control over contact
- Opt-in system (acceptance required)
- Data not sold to vendors

### Platform Safety
- Admin moderation prevents abuse
- Customers protected from spam
- Vendors verified before access granted
- All messages logged for safety

---

## Summary

This privacy-protected messaging system ensures:

1. **Vendors CANNOT see customer email/phone** until approved
2. **Admin reviews EVERY contact request** before approval
3. **Customer must ACCEPT** even after admin approval
4. **All communication** happens in-platform (no direct contact)
5. **Full audit trail** for compliance and safety

**Result:** Customers feel safe purchasing from multiple vendors, knowing their personal information is protected and only shared when necessary and with their explicit consent.
