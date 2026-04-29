import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json({ error: 'Valid quantity required' }, { status: 400 });
    }

    if (quantity === 0) {
      await supabase.from('cart_items').delete().eq('id', params.itemId);
    } else {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', params.itemId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const supabase = createClient();

    await supabase.from('cart_items').delete().eq('id', params.itemId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
