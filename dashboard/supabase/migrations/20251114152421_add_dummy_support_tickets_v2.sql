/*
  # Add Dummy Support Tickets

  Insert test support tickets with various statuses and priorities
*/

DO $$
DECLARE
  v_vendor_id uuid;
  v_ticket1_id uuid;
  v_ticket2_id uuid;
  v_ticket3_id uuid;
  v_ticket4_id uuid;
  v_ticket5_id uuid;
BEGIN
  -- Get vendor ID
  SELECT id INTO v_vendor_id FROM vendors WHERE business_name = 'Test Vendor Store' LIMIT 1;
  
  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Test vendor not found';
  END IF;

  -- Delete existing test tickets
  DELETE FROM support_tickets WHERE vendor_id = v_vendor_id;

  -- Ticket 1: Open - High Priority (Payout Issue)
  INSERT INTO support_tickets (
    vendor_id, ticket_number, subject, description, category, priority, status, created_at
  ) VALUES (
    v_vendor_id, 'TKT-2024-0001', 'Payout not received this week',
    'I was expecting my weekly payout on Monday but it has not arrived in my bank account yet. Can you please check the status?',
    'billing', 'high', 'open', NOW() - INTERVAL '2 hours'
  ) RETURNING id INTO v_ticket1_id;

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket1_id, 'vendor',
    'I was expecting my weekly payout on Monday but it has not arrived in my bank account yet. Can you please check the status? My last payout was processed successfully on ' || TO_CHAR(NOW() - INTERVAL '14 days', 'Mon DD, YYYY'),
    NOW() - INTERVAL '2 hours'
  );

  -- Ticket 2: In Progress - Medium Priority
  INSERT INTO support_tickets (
    vendor_id, ticket_number, subject, description, category, priority, status, created_at
  ) VALUES (
    v_vendor_id, 'TKT-2024-0002', 'How to add custom shipping rates?',
    'I would like to set up custom shipping rates for different regions.',
    'shipping', 'medium', 'in_progress', NOW() - INTERVAL '1 day'
  ) RETURNING id INTO v_ticket2_id;

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket2_id, 'vendor',
    'I would like to set up custom shipping rates for different regions. Can you guide me through the process?',
    NOW() - INTERVAL '1 day'
  );

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket2_id, 'support',
    'Thank you for reaching out! I would be happy to help you set up custom shipping rates. To get started, navigate to Settings > Shipping in your dashboard. From there, you can add region-specific rates. Would you like me to provide a step-by-step guide?',
    NOW() - INTERVAL '20 hours'
  );

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket2_id, 'vendor',
    'Yes please! A step-by-step guide would be very helpful. Also, can I set different rates for different product categories?',
    NOW() - INTERVAL '18 hours'
  );

  -- Ticket 3: Waiting Response - Low Priority
  INSERT INTO support_tickets (
    vendor_id, ticket_number, subject, description, category, priority, status, created_at
  ) VALUES (
    v_vendor_id, 'TKT-2024-0003', 'Question about product analytics',
    'Where can I view detailed analytics for individual products?',
    'general', 'low', 'waiting_response', NOW() - INTERVAL '3 days'
  ) RETURNING id INTO v_ticket3_id;

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket3_id, 'vendor',
    'Where can I view detailed analytics for individual products? I want to see which products are performing best.',
    NOW() - INTERVAL '3 days'
  );

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket3_id, 'support',
    'You can find product analytics in the Analytics section of your dashboard. Click on the Products tab to see detailed metrics for each item including views, sales, conversion rates, and revenue. You can also export this data to CSV. Is there a specific metric you are looking to track?',
    NOW() - INTERVAL '2 days 20 hours'
  );

  -- Ticket 4: Resolved - Urgent Priority
  INSERT INTO support_tickets (
    vendor_id, ticket_number, subject, description, category, priority, status, created_at, resolved_at
  ) VALUES (
    v_vendor_id, 'TKT-2024-0004', 'Unable to upload product images',
    'Getting an error when trying to upload product images.',
    'technical', 'urgent', 'resolved', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'
  ) RETURNING id INTO v_ticket4_id;

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket4_id, 'vendor',
    'Getting an error when trying to upload product images. The upload button is not working. This is urgent as I need to list new products today.',
    NOW() - INTERVAL '5 days'
  );

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket4_id, 'support',
    'I apologize for the inconvenience. This was a temporary server issue that has now been resolved. Please try uploading again and let me know if you continue to experience any problems.',
    NOW() - INTERVAL '4 days 22 hours'
  );

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket4_id, 'vendor',
    'Working now! Thank you for the quick response.',
    NOW() - INTERVAL '4 days'
  );

  -- Ticket 5: Closed - Medium Priority
  INSERT INTO support_tickets (
    vendor_id, ticket_number, subject, description, category, priority, status, created_at, resolved_at
  ) VALUES (
    v_vendor_id, 'TKT-2024-0005', 'How to update business information?',
    'I need to update my business address and tax ID.',
    'account', 'medium', 'closed', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'
  ) RETURNING id INTO v_ticket5_id;

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket5_id, 'vendor',
    'I need to update my business address and tax ID. Where can I do this?',
    NOW() - INTERVAL '7 days'
  );

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket5_id, 'support',
    'You can update your business information by going to Profile > Vendor Profile in your dashboard. From there, you can edit your business address, contact information, and tax details. Let me know if you need any help with this!',
    NOW() - INTERVAL '6 days 20 hours'
  );

  INSERT INTO ticket_messages (ticket_id, sender_type, message, created_at)
  VALUES (
    v_ticket5_id, 'vendor',
    'Found it! Thanks so much for your help.',
    NOW() - INTERVAL '6 days'
  );

END $$;
