import { supabase } from './supabase';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
  bundleId?: string;
  bundleDiscount?: number;
}

export async function syncCartToDatabase(cart: CartItem[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    await supabase
      .from('user_carts')
      .delete()
      .eq('user_id', user.id);

    if (cart.length === 0) {
      return { success: true };
    }

    const cartItems = cart.map(item => ({
      user_id: user.id,
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      bundle_id: item.bundleId || null,
      bundle_discount: item.bundleDiscount || null,
    }));

    const { error } = await supabase
      .from('user_carts')
      .insert(cartItems);

    if (error) {
      console.error('Error syncing cart:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing cart:', error);
    return { success: false, error };
  }
}

export async function loadCartFromDatabase() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, cart: [] };
    }

    const { data: cartItems, error } = await supabase
      .from('user_carts')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading cart:', error);
      return { success: false, cart: [] };
    }

    const cart = cartItems.map(item => ({
      id: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      bundleId: item.bundle_id,
      bundleDiscount: item.bundle_discount,
    }));

    return { success: true, cart };
  } catch (error) {
    console.error('Error loading cart:', error);
    return { success: false, cart: [] };
  }
}

export async function clearCartInDatabase() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false };
    }

    const { error } = await supabase
      .from('user_carts')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error };
  }
}
