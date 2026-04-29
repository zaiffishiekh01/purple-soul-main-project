import { createClient } from '@supabase/supabase-js';
import { Product, Collection, Category, Vendor, CartItem, Order } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseDataAdapter {
  async getProducts(filters?: {
    layer1?: string;
    layer2?: string;
    traditions?: string[];
    purposes?: string[];
    occasions?: string[];
    vendorId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*, vendor:vendors(*)')
      .eq('is_active', true);

    if (filters?.layer1) {
      query = query.eq('layer1_category_slug', filters.layer1);
    }

    if (filters?.layer2) {
      query = query.eq('layer2_category_slug', filters.layer2);
    }

    if (filters?.traditions && filters.traditions.length > 0) {
      query = query.overlaps('traditions', filters.traditions);
    }

    if (filters?.purposes && filters.purposes.length > 0) {
      query = query.overlaps('purposes', filters.purposes);
    }

    if (filters?.occasions && filters.occasions.length > 0) {
      query = query.overlaps('occasions', filters.occasions);
    }

    if (filters?.vendorId) {
      query = query.eq('vendor_id', filters.vendorId);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Product[];
  }

  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, vendor:vendors(*)')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data as Product | null;
  }

  async getCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data as Collection[];
  }

  async getCollection(slug: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data as Collection | null;
  }

  async getCategories(layer?: number): Promise<Category[]> {
    let query = supabase.from('categories').select('*').order('sort_order');

    if (layer) {
      query = query.eq('layer', layer);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Category[];
  }

  async getCategory(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data as Category | null;
  }

  async getVendors(): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;
    return data as Vendor[];
  }

  async getVendor(id: string): Promise<Vendor | null> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Vendor | null;
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*, vendor:vendors(*))')
      .eq('user_id', userId);

    if (error) throw error;
    return data as CartItem[];
  }

  async addCartItem(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const { data: product } = await supabase
      .from('products')
      .select('vendor_id')
      .eq('id', productId)
      .single();

    if (!product) throw new Error('Product not found');

    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select('*, product:products(*, vendor:vendors(*))')
        .single();

      if (error) throw error;
      return data as CartItem;
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          vendor_id: product.vendor_id,
          quantity,
        })
        .select('*, product:products(*, vendor:vendors(*))')
        .single();

      if (error) throw error;
      return data as CartItem;
    }
  }

  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select('*, product:products(*, vendor:vendors(*))')
      .single();

    if (error) throw error;
    return data as CartItem;
  }

  async removeCartItem(userId: string, itemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*), vendor:vendors(*)), shipments:shipments(*, vendor:vendors(*)), payments:payments(*)')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Order[];
  }

  async getOrder(userId: string, orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(*), vendor:vendors(*)), shipments:shipments(*, vendor:vendors(*)), payments:payments(*)')
      .eq('id', orderId)
      .eq('customer_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as Order | null;
  }

  async createOrder(userId: string, order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_id: userId,
        status: order.status,
        shipping_address: order.shipping_address,
        contact_info: order.contact_info,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping_cost: order.shipping_cost,
        total: order.total,
        notes: order.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }
}

export const supabaseAdapter = new SupabaseDataAdapter();
