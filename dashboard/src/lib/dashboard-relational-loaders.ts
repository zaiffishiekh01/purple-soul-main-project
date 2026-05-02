/**
 * Client entry points for relational dashboard reads.
 * Data is loaded via dedicated Route Handlers with explicit SQL (JOINs), not PostgREST embed strings.
 */

import { dedupeInFlight } from './in-flight-dedupe';

async function dashboardGet<T>(path: string): Promise<T> {
  return dedupeInFlight(`GET:${path}`, async () => {
    const res = await fetch(path, { credentials: 'include' });
    const body = (await res.json()) as { data: T; error?: string | null };
    if (!res.ok || body.error) {
      throw new Error(typeof body.error === 'string' ? body.error : `Request failed: ${res.status}`);
    }
    return body.data;
  });
}

export async function loadOrdersWithItemsAndProducts(opts: {
  isAdmin: boolean;
  vendorId?: string;
}): Promise<unknown[]> {
  const qs = new URLSearchParams();
  if (opts.vendorId) qs.set('vendorId', opts.vendorId);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return dashboardGet<unknown[]>(`/api/dashboard/orders-with-items${suffix}`);
}

export async function loadTransactionsWithVendors(opts: {
  isAdmin: boolean;
  vendorId?: string;
}): Promise<unknown[]> {
  const qs = new URLSearchParams();
  if (opts.vendorId) qs.set('vendorId', opts.vendorId);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return dashboardGet<unknown[]>(`/api/dashboard/transactions-with-vendors${suffix}`);
}

export async function loadPayoutRequestsWithVendors(): Promise<unknown[]> {
  return dashboardGet<unknown[]>('/api/dashboard/payout-requests');
}

export async function loadPlatformFeesWithVendors(): Promise<unknown[]> {
  return dashboardGet<unknown[]>('/api/dashboard/platform-fees');
}

export async function loadShippingLabelsWithOrdersAndVendors(opts: {
  carrierEq?: string | null;
}): Promise<unknown[]> {
  const qs = new URLSearchParams();
  if (opts.carrierEq && opts.carrierEq !== 'all') {
    qs.set('carrierEq', opts.carrierEq);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return dashboardGet<unknown[]>(`/api/dashboard/shipping-labels${suffix}`);
}

export async function loadReturnsWithVendorAndOrders(opts: {
  statusEq?: string | null;
}): Promise<unknown[]> {
  const qs = new URLSearchParams();
  if (opts.statusEq && opts.statusEq !== 'all') {
    qs.set('statusEq', opts.statusEq);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return dashboardGet<unknown[]>(`/api/dashboard/returns${suffix}`);
}

export async function loadAdminInventoryWithRelations(): Promise<unknown[]> {
  return dashboardGet<unknown[]>('/api/dashboard/inventory?scope=admin');
}

export async function loadVendorInventoryWithProducts(vendorId: string): Promise<unknown[]> {
  const qs = new URLSearchParams({ scope: 'vendor', vendorId });
  return dashboardGet<unknown[]>(`/api/dashboard/inventory?${qs.toString()}`);
}

export async function loadVendorShipmentsWithOrderInfo(vendorId: string): Promise<unknown[]> {
  const qs = new URLSearchParams({ scope: 'vendor', vendorId });
  return dashboardGet<unknown[]>(`/api/dashboard/shipments?${qs.toString()}`);
}

export async function loadAdminShipmentsWithRelations(opts: {
  statusEq?: string | null;
}): Promise<unknown[]> {
  const qs = new URLSearchParams({ scope: 'admin' });
  if (opts.statusEq && opts.statusEq !== 'all') {
    qs.set('statusEq', opts.statusEq);
  }
  return dashboardGet<unknown[]>(`/api/dashboard/shipments?${qs.toString()}`);
}
