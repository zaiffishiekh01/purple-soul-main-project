import { NextRequest, NextResponse } from 'next/server';
import { withVendorAuth, logVendorAction } from '@/lib/api/vendor';
import { createClient } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const supabase = createClient();
      const { orderId } = params;

      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          subtotal,
          shipping_cost,
          tax_amount,
          total_amount,
          payment_method,
          payment_status,
          customer_email,
          customer_phone,
          shipping_address,
          billing_address,
          tracking_number,
          notes,
          created_at,
          updated_at,
          order_items(
            id,
            quantity,
            unit_price,
            subtotal,
            products(
              id,
              name,
              sku,
              images
            )
          ),
          shipping_methods(
            id,
            name,
            carrier,
            estimated_days
          )
        `)
        .eq('id', orderId)
        .eq('vendor_id', ctx.vendorId)
        .maybeSingle();

      if (error) {
        console.error('Order query error:', error);
        throw error;
      }

      if (!order) {
        await logVendorAction(
          ctx.userId,
          'view_order_details',
          'order',
          orderId,
          request,
          'failure',
          'Order not found'
        );

        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      await logVendorAction(
        ctx.userId,
        'view_order_details',
        'order',
        orderId,
        request
      );

      return NextResponse.json({ order });
    } catch (error) {
      console.error('Vendor order details error:', error);

      await logVendorAction(
        ctx.userId,
        'view_order_details',
        'order',
        params.orderId,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json(
        { error: 'Failed to fetch order details' },
        { status: 500 }
      );
    }
  });
}
