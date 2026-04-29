import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { withVendorAuth, logVendorAction } from '@/lib/api/vendor';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const body = await request.json();
      const { status, tracking_number, shipping_carrier, notes } = body;

      if (!status) {
        return NextResponse.json({ error: 'Status is required' }, { status: 400 });
      }

      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      const supabase = createClient();

      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('id, vendor_id, status, shipped_at, delivered_at')
        .eq('id', params.orderId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (order.vendor_id !== ctx.vendorId) {
        return NextResponse.json({ error: 'Forbidden: Not your order' }, { status: 403 });
      }

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (tracking_number) updateData.tracking_number = tracking_number;
      if (shipping_carrier) updateData.shipping_carrier = shipping_carrier;
      if (notes) updateData.vendor_notes = notes;

      if (status === 'shipped' && !order.shipped_at) {
        updateData.shipped_at = new Date().toISOString();
      }

      if (status === 'delivered' && !order.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }

      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', params.orderId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: params.orderId,
          status,
          notes: notes || `Order status updated to ${status}`,
          changed_by: ctx.userId,
        });

      if (historyError) {
        console.error('Failed to log status history:', historyError);
      }

      await logVendorAction(ctx.userId, 'update_order_status', 'order', params.orderId, request);

      return NextResponse.json({
        success: true,
        order: updatedOrder,
      });

    } catch (error) {
      console.error('Order status update error:', error);

      await logVendorAction(
        ctx.userId,
        'update_order_status',
        'order',
        params.orderId,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
