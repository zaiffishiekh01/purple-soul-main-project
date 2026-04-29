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

      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (id, name, slug),
          product_images (id, url, alt_text, display_order, is_primary)
        `)
        .eq('id', params.productId)
        .eq('vendor_id', ctx.vendorId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ product });

    } catch (error) {
      console.error('Product fetch error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const body = await request.json();
      const {
        name,
        description,
        price,
        compare_at_price,
        category_id,
        materials,
        dimensions,
        weight,
        origin_country,
        is_active,
        is_featured,
        tags,
        meta_title,
        meta_description,
      } = body;

      const supabase = createClient();

      const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('id, vendor_id')
        .eq('id', params.productId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!existingProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      if (existingProduct.vendor_id !== ctx.vendorId) {
        return NextResponse.json({ error: 'Forbidden: Not your product' }, { status: 403 });
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (compare_at_price !== undefined) updateData.compare_at_price = compare_at_price;
      if (category_id !== undefined) updateData.category_id = category_id;
      if (materials !== undefined) updateData.materials = materials;
      if (dimensions !== undefined) updateData.dimensions = dimensions;
      if (weight !== undefined) updateData.weight = weight;
      if (origin_country !== undefined) updateData.origin_country = origin_country;
      if (is_active !== undefined) updateData.is_active = is_active;
      if (is_featured !== undefined) updateData.is_featured = is_featured;
      if (tags !== undefined) updateData.tags = tags;
      if (meta_title !== undefined) updateData.meta_title = meta_title;
      if (meta_description !== undefined) updateData.meta_description = meta_description;

      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', params.productId)
        .select(`
          *,
          categories (id, name, slug),
          product_images (id, url, alt_text, display_order, is_primary)
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      await logVendorAction(ctx.userId, 'update_product', 'product', params.productId, request);

      return NextResponse.json({
        success: true,
        product: updatedProduct,
      });

    } catch (error) {
      console.error('Product update error:', error);

      await logVendorAction(
        ctx.userId,
        'update_product',
        'product',
        params.productId,
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
  { params }: { params: { productId: string } }
) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const supabase = createClient();

      const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('id, vendor_id')
        .eq('id', params.productId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!existingProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      if (existingProduct.vendor_id !== ctx.vendorId) {
        return NextResponse.json({ error: 'Forbidden: Not your product' }, { status: 403 });
      }

      const { error: deleteError } = await supabase
        .from('products')
        .update({
          is_active: false,
          deleted_at: new Date().toISOString()
        })
        .eq('id', params.productId);

      if (deleteError) {
        throw deleteError;
      }

      await logVendorAction(ctx.userId, 'delete_product', 'product', params.productId, request);

      return NextResponse.json({
        success: true,
        message: 'Product soft deleted successfully',
      });

    } catch (error) {
      console.error('Product delete error:', error);

      await logVendorAction(
        ctx.userId,
        'delete_product',
        'product',
        params.productId,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
