import { supabase } from './supabase';

export interface OrderData {
  orderNumber: string;
  cart: any[];
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  };
  paymentMethod?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export async function saveOrder(orderData: OrderData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const defaultShipping = {
      name: 'Guest Customer',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US',
      phone: '555-0100',
    };

    const shipping = orderData.shippingAddress || defaultShipping;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        order_number: orderData.orderNumber,
        status: 'pending',
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        discount: orderData.discount,
        total: orderData.total,
        shipping_address: shipping,
        payment_method: orderData.paymentMethod || 'Credit Card',
        payment_status: 'paid',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return { success: false, error: orderError };
    }

    const orderItems = orderData.cart.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      price: item.price,
      quantity: item.quantity,
      selected_color: item.selectedColor || null,
      selected_size: item.selectedSize || null,
      bundle_id: item.bundleId || null,
      bundle_discount: item.bundleDiscount || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      await supabase.from('orders').delete().eq('id', order.id);
      return { success: false, error: itemsError };
    }

    return { success: true, order };
  } catch (error) {
    console.error('Error saving order:', error);
    return { success: false, error };
  }
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError) {
      return { success: false, error: orderError };
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsError) {
      return { success: false, error: itemsError };
    }

    return { success: true, order: { ...order, items } };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getUserOrders(limit: number = 10) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error };
    }

    return { success: true, orders };
  } catch (error) {
    return { success: false, error };
  }
}
