import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { withVendorAuth, logVendorAction } from '@/lib/api/vendor';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const supabase = createClient();

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, vendor_id')
        .eq('id', params.productId)
        .maybeSingle();

      if (productError || !product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      if (product.vendor_id !== ctx.vendorId) {
        return NextResponse.json({ error: 'Forbidden: Not your product' }, { status: 403 });
      }

      const { data: images, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', params.productId)
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      return NextResponse.json({ images: images || [] });

    } catch (error) {
      console.error('Product images fetch error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const body = await request.json();
      const { url, alt_text, is_primary, display_order } = body;

      if (!url) {
        return NextResponse.json({ error: 'url is required' }, { status: 400 });
      }

      const supabase = createClient();

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, vendor_id')
        .eq('id', params.productId)
        .maybeSingle();

      if (productError || !product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      if (product.vendor_id !== ctx.vendorId) {
        return NextResponse.json({ error: 'Forbidden: Not your product' }, { status: 403 });
      }

      if (is_primary) {
        await supabase
          .from('product_images')
          .update({ is_primary: false })
          .eq('product_id', params.productId);
      }

      const { data: existingImages } = await supabase
        .from('product_images')
        .select('display_order')
        .eq('product_id', params.productId)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextDisplayOrder = existingImages?.[0]?.display_order
        ? existingImages[0].display_order + 1
        : 0;

      const { data: newImage, error: insertError } = await supabase
        .from('product_images')
        .insert({
          product_id: params.productId,
          url,
          alt_text: alt_text || '',
          is_primary: is_primary || false,
          display_order: display_order !== undefined ? display_order : nextDisplayOrder,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      await logVendorAction(ctx.userId, 'add_product_image', 'product_image', newImage.id, request);

      return NextResponse.json({
        success: true,
        image: newImage,
      });

    } catch (error) {
      console.error('Product image add error:', error);

      await logVendorAction(
        ctx.userId,
        'add_product_image',
        'product_image',
        null,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
