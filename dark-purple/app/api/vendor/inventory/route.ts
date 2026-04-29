import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, sku, stock_quantity, low_stock_threshold, reorder_quantity, price')
    .eq('vendor_id', vendor.id)
    .order('title');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: alerts } = await supabase
    .from('inventory_alerts')
    .select('*')
    .eq('vendor_id', vendor.id)
    .eq('is_resolved', false);

  return NextResponse.json({ products, alerts: alerts || [] });
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();
  const { product_id, quantity_change, reason, transaction_type } = body;

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const { data, error } = await supabase.rpc('create_inventory_transaction', {
    p_product_id: product_id,
    p_vendor_id: vendor.id,
    p_transaction_type: transaction_type || 'adjustment',
    p_quantity_change: quantity_change,
    p_reason: reason || null,
    p_created_by: user.id
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, transaction_id: data });
}
