import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Vendor Contact Request API
 *
 * Vendors use this to request permission to contact customers.
 * Requires admin approval before any contact is allowed.
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { customer_id, order_id, product_id, reason_category, reason_text } = body;

    // Validate required fields
    if (!customer_id || !reason_category || !reason_text) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, reason_category, reason_text' },
        { status: 400 }
      );
    }

    // Validate reason_text length
    if (reason_text.length < 20 || reason_text.length > 1000) {
      return NextResponse.json(
        { error: 'Reason must be between 20 and 1000 characters' },
        { status: 400 }
      );
    }

    // Get vendor_id for current user
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', user.id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found. Only vendors can request customer contact.' },
        { status: 403 }
      );
    }

    // Check if there's already a pending or approved request for this order/customer
    const { data: existingRequest } = await supabase
      .from('contact_requests')
      .select('id, status')
      .eq('vendor_id', vendor.id)
      .eq('customer_id', customer_id)
      .eq('order_id', order_id)
      .in('status', ['pending', 'approved'])
      .maybeSingle();

    if (existingRequest) {
      return NextResponse.json(
        {
          error: `Contact request already ${existingRequest.status}`,
          request_id: existingRequest.id
        },
        { status: 409 }
      );
    }

    // Create contact request
    const { data: contactRequest, error: createError } = await supabase
      .from('contact_requests')
      .insert({
        vendor_id: vendor.id,
        customer_id,
        order_id,
        product_id,
        reason_category,
        reason_text,
        status: 'pending'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating contact request:', createError);
      return NextResponse.json(
        { error: 'Failed to create contact request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contact_request: contactRequest,
      message: 'Contact request submitted. Admin will review and notify you.'
    });

  } catch (error) {
    console.error('Contact request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET - List vendor's contact requests
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

    // Get vendor_id
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 403 }
      );
    }

    // Get all contact requests for this vendor
    const { data: requests, error: fetchError } = await supabase
      .from('contact_requests')
      .select(`
        *,
        order:orders(order_number, total, created_at),
        product:products(title, images)
      `)
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false });

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
    console.error('GET contact requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
