import { createClient } from '@/lib/supabase/client';

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product_variant_id?: string;
  quantity: number;
  price_at_addition: number;
  product?: {
    id: string;
    title: string;
    price: number;
    images: string[];
    vendor_id: string;
  };
}

export interface Cart {
  id: string;
  user_id?: string;
  session_token?: string;
  coupon_code?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export async function getOrCreateCart(userId?: string): Promise<string> {
  const supabase = createClient();

  if (userId) {
    // Handle dev bypass user with session token instead
    if (userId === 'dev-bypass-id') {
      let sessionToken = localStorage.getItem('dev_cart_session_token');
      if (!sessionToken) {
        sessionToken = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('dev_cart_session_token', sessionToken);
      }

      const { data: existing } = await supabase
        .from('carts')
        .select('id')
        .eq('session_token', sessionToken)
        .maybeSingle();

      if (existing) return existing.id;

      const { data: newCart, error } = await supabase
        .from('carts')
        .insert({ session_token: sessionToken })
        .select('id')
        .single();

      if (error) throw error;
      return newCart.id;
    }

    const { data: existing } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: newCart, error } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select('id')
      .single();

    if (error) throw error;
    return newCart.id;
  }

  let sessionToken = localStorage.getItem('cart_session_token');
  if (!sessionToken) {
    sessionToken = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cart_session_token', sessionToken);
  }

  const { data: existing } = await supabase
    .from('carts')
    .select('id')
    .eq('session_token', sessionToken)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: newCart, error } = await supabase
    .from('carts')
    .insert({ session_token: sessionToken })
    .select('id')
    .single();

  if (error) throw error;
  return newCart.id;
}

export async function getCart(userId?: string): Promise<Cart | null> {
  const supabase = createClient();

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

  if (userId) {
    // Handle dev bypass user with session token instead
    if (userId === 'dev-bypass-id') {
      const sessionToken = localStorage.getItem('dev_cart_session_token');
      if (!sessionToken) return null;
      query = query.eq('session_token', sessionToken);
    } else {
      query = query.eq('user_id', userId);
    }
  } else {
    const sessionToken = localStorage.getItem('cart_session_token');
    if (!sessionToken) return null;
    query = query.eq('session_token', sessionToken);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) return null;

  const rawItems = data.cart_items || [];
  const items = rawItems.map((item: any) => ({
    ...item,
    product: Array.isArray(item.product) ? item.product[0] : item.product
  }));

  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (item.price_at_addition * item.quantity);
  }, 0);

  const discount = 0; // TODO: Calculate based on coupon_code

  return {
    id: data.id,
    user_id: data.user_id,
    session_token: data.session_token,
    coupon_code: data.coupon_code,
    items,
    subtotal,
    discount,
    total: subtotal - discount
  };
}

export async function addToCart(
  productId: string,
  quantity: number = 1,
  userId?: string
): Promise<void> {
  const supabase = createClient();
  const cartId = await getOrCreateCart(userId);

  const { data: product } = await supabase
    .from('products')
    .select('price')
    .eq('id', productId)
    .single();

  if (!product) throw new Error('Product not found');

  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existingItem) {
    await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id);
  } else {
    await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        product_id: productId,
        quantity,
        price_at_addition: product.price
      });
  }
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<void> {
  const supabase = createClient();

  if (quantity <= 0) {
    await supabase.from('cart_items').delete().eq('id', itemId);
  } else {
    await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);
  }
}

export async function removeFromCart(itemId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('cart_items').delete().eq('id', itemId);
}

export async function clearCart(userId?: string): Promise<void> {
  const supabase = createClient();

  let query = supabase.from('cart_items').delete();

  if (userId) {
    // Handle dev bypass user with session token instead
    if (userId === 'dev-bypass-id') {
      const sessionToken = localStorage.getItem('dev_cart_session_token');
      if (sessionToken) {
        const { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('session_token', sessionToken)
          .maybeSingle();

        if (cart) {
          await supabase.from('cart_items').delete().eq('cart_id', cart.id);
        }
      }
    } else {
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (cart) {
        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
      }
    }
  } else {
    const sessionToken = localStorage.getItem('cart_session_token');
    if (sessionToken) {
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('session_token', sessionToken)
        .maybeSingle();

      if (cart) {
        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
      }
    }
  }
}

export async function applyCoupon(
  couponCode: string,
  userId?: string
): Promise<{ valid: boolean; discount?: number; error?: string }> {
  const supabase = createClient();

  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', couponCode.toUpperCase())
    .eq('is_active', true)
    .maybeSingle();

  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  const now = new Date();
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return { valid: false, error: 'Coupon has expired' };
  }

  if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  const cart = await getCart(userId);
  if (!cart) {
    return { valid: false, error: 'Cart not found' };
  }

  if (cart.subtotal < coupon.min_purchase_amount) {
    return {
      valid: false,
      error: `Minimum purchase of $${coupon.min_purchase_amount} required`
    };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (cart.subtotal * coupon.discount_value) / 100;
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, coupon.max_discount_amount);
    }
  } else {
    discount = coupon.discount_value;
  }

  await supabase
    .from('carts')
    .update({ coupon_code: couponCode.toUpperCase() })
    .eq('id', cart.id);

  return { valid: true, discount };
}

export async function removeCoupon(userId?: string): Promise<void> {
  const supabase = createClient();

  const cart = await getCart(userId);
  if (cart) {
    await supabase
      .from('carts')
      .update({ coupon_code: null })
      .eq('id', cart.id);
  }
}
