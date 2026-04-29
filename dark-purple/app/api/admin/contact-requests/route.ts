import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin Contact Request Management API
 *
 * Admins review and approve/reject vendor requests to contact customers.
 * This enforces privacy protection by requiring admin oversight.
 */

/**
 * GET - List all pending contact requests (admin only)
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

    // Verify admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';

    // Fetch contact requests
    let query = supabase
      .from('contact_requests')
      .select(`
        *,
        vendor:vendors(id, business_name, email, logo_url),
        customer:users!contact_requests_customer_id_fkey(id, full_name, email),
        order:orders(order_number, total, created_at, status),
        product:products(title, images)
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: requests, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching contact requests:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch contact requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      requests: requests || []
    });

  } catch (error) {
    console.error('GET admin contact requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Approve or reject a contact request
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { request_id, action, admin_notes } = body;

    if (!request_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: request_id, action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Update contact request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('contact_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by_admin_id: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: admin_notes || null
      })
      .eq('id', request_id)
      .select(`
        *,
        vendor:vendors(id, business_name, email),
        customer:users!contact_requests_customer_id_fkey(id, full_name, email)
      `)
      .single();

    if (updateError) {
      console.error('Error updating contact request:', updateError);
      return NextResponse.json(
        { error: 'Failed to update contact request' },
        { status: 500 }
      );
    }

    // If approved, create message thread
    if (action === 'approve') {
      const { data: thread, error: threadError } = await supabase
        .from('message_threads')
        .insert({
          vendor_id: updatedRequest.vendor_id,
          customer_id: updatedRequest.customer_id,
          order_id: updatedRequest.order_id,
          contact_request_id: updatedRequest.id,
          subject: `Order #${updatedRequest.order?.order_number || 'N/A'} - ${updatedRequest.reason_category}`,
          status: 'active'
        })
        .select()
        .single();

      if (threadError) {
        console.error('Error creating message thread:', threadError);
      }

      // TODO: Send notification to customer
      // "Vendor [name] has requested to contact you about Order #[number]"
    }

    return NextResponse.json({
      success: true,
      contact_request: updatedRequest,
      message: action === 'approve'
        ? 'Contact request approved. Message thread created.'
        : 'Contact request rejected.'
    });

  } catch (error) {
    console.error('PATCH contact request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
