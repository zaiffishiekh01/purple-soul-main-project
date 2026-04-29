import { mockVendors, mockProducts, mockCollections, mockCategories } from '../mock-data';
import { Product, Collection, Category, Vendor, CartItem, Order } from '@/types';

export class MockDataAdapter {
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
    let products = [...mockProducts];

    if (filters?.layer1) {
      products = products.filter(p => p.layer1_category_slug === filters.layer1);
    }

    if (filters?.layer2) {
      products = products.filter(p => p.layer2_category_slug === filters.layer2);
    }

    if (filters?.traditions && filters.traditions.length > 0) {
      products = products.filter(p =>
        p.traditions.some(t => filters.traditions!.includes(t))
      );
    }

    if (filters?.purposes && filters.purposes.length > 0) {
      products = products.filter(p =>
        p.purposes.some(t => filters.purposes!.includes(t))
      );
    }

    if (filters?.occasions && filters.occasions.length > 0) {
      products = products.filter(p =>
        p.occasions.some(t => filters.occasions!.includes(t))
      );
    }

    if (filters?.vendorId) {
      products = products.filter(p => p.vendor_id === filters.vendorId);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    const start = filters?.offset || 0;
    const end = start + (filters?.limit || products.length);

    const result = products.slice(start, end);

    return result.map(p => ({
      ...p,
      vendor: mockVendors.find(v => v.id === p.vendor_id)
    }));
  }

  async getProduct(id: string): Promise<Product | null> {
    const product = mockProducts.find(p => p.id === id);
    if (!product) return null;

    return {
      ...product,
      vendor: mockVendors.find(v => v.id === product.vendor_id)
    };
  }

  async getCollections(): Promise<Collection[]> {
    return mockCollections.filter(c => c.is_active);
  }

  async getCollection(slug: string): Promise<Collection | null> {
    return mockCollections.find(c => c.slug === slug && c.is_active) || null;
  }

  async getCategories(layer?: number): Promise<Category[]> {
    if (layer) {
      return mockCategories.filter(c => c.layer === layer);
    }
    return mockCategories;
  }

  async getCategory(slug: string): Promise<Category | null> {
    return mockCategories.find(c => c.slug === slug) || null;
  }

  async getVendors(): Promise<Vendor[]> {
    return mockVendors.filter(v => v.status === 'active');
  }

  async getVendor(id: string): Promise<Vendor | null> {
    return mockVendors.find(v => v.id === id) || null;
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    const storageKey = `cart_${userId}`;
    const cartData = localStorage.getItem(storageKey);
    if (!cartData) return [];

    const items: CartItem[] = JSON.parse(cartData);

    return items.map(item => ({
      ...item,
      product: mockProducts.find(p => p.id === item.product_id)
    }));
  }

  async addCartItem(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const storageKey = `cart_${userId}`;
    const cartData = localStorage.getItem(storageKey);
    const items: CartItem[] = cartData ? JSON.parse(cartData) : [];

    const existingIndex = items.findIndex(i => i.product_id === productId);

    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
      items[existingIndex].updated_at = new Date().toISOString();
    } else {
      const newItem: CartItem = {
        id: `cart-item-${Date.now()}`,
        user_id: userId,
        product_id: productId,
        vendor_id: product.vendor_id,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      items.push(newItem);
    }

    localStorage.setItem(storageKey, JSON.stringify(items));

    const updatedItem = items.find(i => i.product_id === productId)!;
    return {
      ...updatedItem,
      product
    };
  }

  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartItem> {
    const storageKey = `cart_${userId}`;
    const cartData = localStorage.getItem(storageKey);
    if (!cartData) throw new Error('Cart not found');

    const items: CartItem[] = JSON.parse(cartData);
    const itemIndex = items.findIndex(i => i.id === itemId);

    if (itemIndex < 0) throw new Error('Cart item not found');

    items[itemIndex].quantity = quantity;
    items[itemIndex].updated_at = new Date().toISOString();

    localStorage.setItem(storageKey, JSON.stringify(items));

    const product = mockProducts.find(p => p.id === items[itemIndex].product_id);
    return {
      ...items[itemIndex],
      product
    };
  }

  async removeCartItem(userId: string, itemId: string): Promise<void> {
    const storageKey = `cart_${userId}`;
    const cartData = localStorage.getItem(storageKey);
    if (!cartData) return;

    const items: CartItem[] = JSON.parse(cartData);
    const filtered = items.filter(i => i.id !== itemId);

    localStorage.setItem(storageKey, JSON.stringify(filtered));
  }

  async clearCart(userId: string): Promise<void> {
    const storageKey = `cart_${userId}`;
    localStorage.removeItem(storageKey);
  }

  async getOrders(userId: string): Promise<Order[]> {
    const storageKey = `orders_${userId}`;
    const ordersData = localStorage.getItem(storageKey);
    if (!ordersData) return [];

    return JSON.parse(ordersData);
  }

  async getOrder(userId: string, orderId: string): Promise<Order | null> {
    const orders = await this.getOrders(userId);
    return orders.find(o => o.id === orderId) || null;
  }

  async createOrder(userId: string, order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const storageKey = `orders_${userId}`;
    const ordersData = localStorage.getItem(storageKey);
    const orders: Order[] = ordersData ? JSON.parse(ordersData) : [];

    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    orders.push(newOrder);
    localStorage.setItem(storageKey, JSON.stringify(orders));

    return newOrder;
  }
}

export const mockAdapter = new MockDataAdapter();
