import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { withVendorAuth, logVendorAction } from '@/lib/api/vendor';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string; imageId: string } }
) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const body = await request.json();
      const { url, alt_text, is_primary, display_order } = body;

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

      const { data: existingImage, error: imageError } = await supabase
        .from('product_images')
        .select('*')
        .eq('id', params.imageId)
        .eq('product_id', params.productId)
        .maybeSingle();

      if (imageError || !existingImage) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }

      if (is_primary) {
        await supabase
          .from('product_images')
          .update({ is_primary: false })
          .eq('product_id', params.productId)
          .neq('id', params.imageId);
      }

      const updateData: any = {};
      if (url !== undefined) updateData.url = url;
      if (alt_text !== undefined) updateData.alt_text = alt_text;
      if (is_primary !== undefined) updateData.is_primary = is_primary;
      if (display_order !== undefined) updateData.display_order = display_order;

      const { data: updatedImage, error: updateError } = await supabase
        .from('product_images')
        .update(updateData)
        .eq('id', params.imageId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      await logVendorAction(ctx.userId, 'update_product_image', 'product_image', params.imageId, request);

      return NextResponse.json({
        success: true,
        image: updatedImage,
      });

    } catch (error) {
      console.error('Product image update error:', error);

      await logVendorAction(
        ctx.userId,
        'update_product_image',
        'product_image',
        params.imageId,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string; imageId: string } }
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

      const { data: existingImage, error: imageError } = await supabase
        .from('product_images')
        .select('*')
        .eq('id', params.imageId)
        .eq('product_id', params.productId)
        .maybeSingle();

      if (imageError || !existingImage) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }

      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', params.imageId);

      if (deleteError) {
        throw deleteError;
      }

      await logVendorAction(ctx.userId, 'delete_product_image', 'product_image', params.imageId, request);

      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully',
      });

    } catch (error) {
      console.error('Product image delete error:', error);

      await logVendorAction(
        ctx.userId,
        'delete_product_image',
        'product_image',
        params.imageId,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
