import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Platform Messaging API
 *
 * Handles in-platform messages between vendors and customers.
 * All communication goes through the platform - no direct email/phone.
 */

/**
 * GET - List message threads for current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role to determine query
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isVendor = userData?.role === 'vendor';
    const isCustomer = userData?.role === 'customer';

    // Fetch threads based on role
    let query = supabase
      .from('message_threads')
      .select(`
        *,
        vendor:vendors(id, business_name, logo_url),
        customer:users!message_threads_customer_id_fkey(id, full_name),
        order:orders(order_number, total),
        messages:vendor_customer_messages(
          id,
          message_text,
          sender_type,
          created_at,
          is_read
        )
      `)
      .order('last_message_at', { ascending: false })
      .limit(1, { foreignTable: 'vendor_customer_messages' });

    if (isVendor) {
      // Vendors see threads where they're the vendor
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('id', user.id)
        .single();

      if (vendor) {
        query = query.eq('vendor_id', vendor.id);
      }
    } else if (isCustomer) {
      // Customers see threads where they're the customer
      query = query.eq('customer_id', user.id);
    }

    const { data: threads, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching message threads:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch message threads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      threads: threads || []
    });

  } catch (error) {
    console.error('GET messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Send a message in a thread
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { thread_id, message_text, attachments } = body;

    if (!thread_id || !message_text) {
      return NextResponse.json(
        { error: 'Missing required fields: thread_id, message_text' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message_text.length < 1 || message_text.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be between 1 and 5000 characters' },
        { status: 400 }
      );
    }

    // Verify thread exists and user is a participant
    const { data: thread } = await supabase
      .from('message_threads')
      .select('*, vendor:vendors(id)')
      .eq('id', thread_id)
      .single();

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Determine sender type
    let senderType: 'customer' | 'vendor' | 'admin' = 'customer';

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role === 'vendor') {
      senderType = 'vendor';
    } else if (userData?.role === 'admin') {
      senderType = 'admin';
    }

    // Verify user is participant in thread
    const isParticipant =
      thread.customer_id === user.id ||
      thread.vendor?.id === user.id ||
      userData?.role === 'admin';

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'You are not a participant in this thread' },
        { status: 403 }
      );
    }

    // Create message
    const { data: message, error: createError } = await supabase
      .from('vendor_customer_messages')
      .insert({
        thread_id,
        sender_type: senderType,
        sender_id: user.id,
        message_text,
        attachments: attachments || []
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating message:', createError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Thread will be updated automatically via trigger

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('POST message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
