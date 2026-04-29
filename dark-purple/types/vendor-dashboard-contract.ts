import { Order, OrderItem, Product, Shipment, Return, Vendor } from './index';

export interface VendorDashboardOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: VendorDashboardOrderItem[];
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface VendorDashboardOrderItem {
  product_id: string;
  product_name: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface VendorDashboardProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  images: string[];
  stock: number;
  category: string;
  status: 'active' | 'draft' | 'archived';
}

export interface VendorDashboardShipment {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: string;
  shipped_at?: string;
  delivered_at?: string;
}

export class VendorDashboardMapper {
  static mapOrderToVendorFormat(order: Order): VendorDashboardOrder {
    return {
      id: order.id,
      order_number: order.id.slice(0, 8).toUpperCase(),
      customer_name: order.shipping_address.fullName,
      customer_email: order.contact_info.email,
      shipping_address: {
        line1: order.shipping_address.addressLine1,
        line2: order.shipping_address.addressLine2,
        city: order.shipping_address.city,
        state: order.shipping_address.state,
        postal_code: order.shipping_address.postalCode,
        country: order.shipping_address.country,
      },
      items: order.items?.map(item => this.mapOrderItemToVendorFormat(item)) || [],
      status: order.status,
      total: order.total,
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }

  static mapOrderItemToVendorFormat(item: OrderItem): VendorDashboardOrderItem {
    return {
      product_id: item.product_id,
      product_name: item.product?.title || 'Unknown Product',
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
    };
  }

  static mapProductToVendorFormat(product: Product): VendorDashboardProduct {
    return {
      id: product.id,
      name: product.title,
      description: product.description,
      price: product.price,
      images: product.images,
      stock: product.stock_quantity,
      category: product.layer1_category_slug || 'uncategorized',
      status: product.is_active ? 'active' : 'archived',
    };
  }

  static mapShipmentToVendorFormat(shipment: Shipment): VendorDashboardShipment {
    return {
      id: shipment.id,
      order_id: shipment.order_id,
      carrier: shipment.carrier || 'Unknown',
      tracking_number: shipment.tracking_number || '',
      status: shipment.status,
      shipped_at: shipment.shipped_at,
      delivered_at: shipment.delivered_at,
    };
  }
}

export interface VendorDashboardWebhookEvent {
  event: 'order.created' | 'order.updated' | 'return.requested' | 'shipment.updated';
  timestamp: string;
  data: any;
  vendor_id: string;
}

export interface VendorDashboardAPIContract {
  getOrders: (vendorId: string, filters?: any) => Promise<VendorDashboardOrder[]>;
  getOrder: (vendorId: string, orderId: string) => Promise<VendorDashboardOrder>;
  updateOrderStatus: (vendorId: string, orderId: string, status: string) => Promise<void>;
  createShipment: (vendorId: string, orderId: string, shipment: Partial<Shipment>) => Promise<Shipment>;
  getProducts: (vendorId: string) => Promise<VendorDashboardProduct[]>;
  updateProduct: (vendorId: string, productId: string, updates: Partial<Product>) => Promise<Product>;
}
