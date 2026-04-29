import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const sessionToken = request.cookies.get('cart_session')?.value;

    let query = supabase
      .from('carts')
      .select(`
        id,
        user_id,
        session_token,
        coupon_code,
        cart_items:cart_items(
          id,
          cart_id,
          product_id,
          product_variant_id,
          quantity,
          price_at_addition,
          product:products(
            id,
            title,
            price,
            images,
            vendor_id
          )
        )
      `);

    if (sessionToken) {
      query = query.eq('session_token', sessionToken);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ cart: null, items: [], subtotal: 0, total: 0 });
    }

    const items = data.cart_items || [];
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.price_at_addition * item.quantity);
    }, 0);

    return NextResponse.json({
      cart: {
        id: data.id,
        coupon_code: data.coupon_code
      },
      items,
      subtotal,
      discount: 0,
      total: subtotal
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const sessionToken = request.cookies.get('cart_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 });
    }

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (cart) {
      await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
