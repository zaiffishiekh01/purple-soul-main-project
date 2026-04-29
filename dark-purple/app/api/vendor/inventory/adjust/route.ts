import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { withVendorAuth, logVendorAction } from '@/lib/api/vendor';

export async function POST(request: NextRequest) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const body = await request.json();
      const { product_id, quantity_change, reason, notes } = body;

      if (!product_id || quantity_change === undefined) {
        return NextResponse.json({
          error: 'product_id and quantity_change are required'
        }, { status: 400 });
      }

      if (!Number.isInteger(quantity_change)) {
        return NextResponse.json({
          error: 'quantity_change must be an integer'
        }, { status: 400 });
      }

      const validReasons = ['restock', 'damaged', 'lost', 'correction', 'return', 'sale', 'other'];
      if (reason && !validReasons.includes(reason)) {
        return NextResponse.json({
          error: 'Invalid reason. Must be one of: ' + validReasons.join(', ')
        }, { status: 400 });
      }

      const supabase = createClient();

      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('id, vendor_id, stock_quantity, name')
        .eq('id', product_id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      if (product.vendor_id !== ctx.vendorId) {
        return NextResponse.json({ error: 'Forbidden: Not your product' }, { status: 403 });
      }

      const currentQuantity = product.stock_quantity || 0;
      const newQuantity = currentQuantity + quantity_change;

      if (newQuantity < 0) {
        return NextResponse.json({
          error: `Cannot reduce inventory below 0. Current: ${currentQuantity}, Change: ${quantity_change}`
        }, { status: 400 });
      }

      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({
          stock_quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product_id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      const { data: historyRecord, error: historyError } = await supabase
        .from('inventory_history')
        .insert({
          product_id,
          vendor_id: ctx.vendorId,
          quantity_change,
          quantity_before: currentQuantity,
          quantity_after: newQuantity,
          reason: reason || 'other',
          notes: notes || `Inventory adjusted by ${quantity_change}`,
          changed_by: ctx.userId,
        })
        .select()
        .single();

      if (historyError) {
        console.error('Failed to log inventory history:', historyError);
      }

      await logVendorAction(ctx.userId, 'adjust_inventory', 'inventory', product_id, request);

      return NextResponse.json({
        success: true,
        product: updatedProduct,
        history: historyRecord,
        previous_quantity: currentQuantity,
        new_quantity: newQuantity,
      });

    } catch (error) {
      console.error('Inventory adjustment error:', error);

      await logVendorAction(
        ctx.userId,
        'adjust_inventory',
        'inventory',
        null,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
