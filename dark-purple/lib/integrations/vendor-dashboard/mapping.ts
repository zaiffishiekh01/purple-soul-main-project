export { VendorDashboardMapper, type VendorDashboardAPIContract, type VendorDashboardWebhookEvent } from '@/types/vendor-dashboard-contract';

export const WEBHOOK_EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  RETURN_REQUESTED: 'return.requested',
  SHIPMENT_UPDATED: 'shipment.updated',
} as const;

export const VENDOR_DASHBOARD_ENDPOINTS = {
  GET_ORDERS: '/api/vendors/:vendorId/orders',
  GET_ORDER: '/api/vendors/:vendorId/orders/:orderId',
  UPDATE_ORDER_STATUS: '/api/vendors/:vendorId/orders/:orderId/status',
  CREATE_SHIPMENT: '/api/vendors/:vendorId/orders/:orderId/shipments',
  GET_PRODUCTS: '/api/vendors/:vendorId/products',
  UPDATE_PRODUCT: '/api/vendors/:vendorId/products/:productId',
} as const;

export function buildVendorEndpoint(template: string, params: Record<string, string>): string {
  let url = template;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`:${key}`, value);
  }
  return url;
}

export const ORDER_STATUS_VENDOR_ACTIONS: Record<string, string[]> = {
  'paid': ['vendor_confirmed'],
  'vendor_confirmed': ['picking'],
  'picking': ['packed'],
  'packed': ['label_created'],
  'label_created': ['shipped'],
  'return_requested': ['return_approved', 'return_rejected'],
  'return_received': ['refund_pending'],
};

export function getAllowedStatusTransitions(currentStatus: string): string[] {
  return ORDER_STATUS_VENDOR_ACTIONS[currentStatus] || [];
}
