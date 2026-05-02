import { query } from '@/src/lib/server/db';
import type { VendorScope } from '@/src/lib/server/dashboard-access';

function parseNum(v: unknown): number {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function mapOrderRow(row: Record<string, unknown>): Record<string, unknown> {
  const out = { ...row };
  for (const k of ['total_amount', 'subtotal', 'tax_amount', 'shipping_cost', 'discount_amount'] as const) {
    if (k in out) out[k] = parseNum(out[k]);
  }
  return out;
}

function vendorWhere(scope: VendorScope, params: unknown[], alias: string): string {
  if (scope.kind === 'admin_all') return '';
  params.push(scope.vendorId);
  return `${alias}.vendor_id = $${params.length}::uuid`;
}

/** Orders with line items and nested product summary (explicit JOINs; not PostgREST embed). */
export async function fetchOrdersWithItemsAndProducts(scope: VendorScope): Promise<unknown[]> {
  const params: unknown[] = [];
  let orderSql = `SELECT o.* FROM orders o`;
  const vw = vendorWhere(scope, params, 'o');
  if (vw) orderSql += ` WHERE ${vw}`;
  orderSql += ` ORDER BY o.created_at DESC LIMIT 5000`;

  const { rows: orders } = await query<Record<string, unknown>>(orderSql, params);
  if (!orders.length) return [];

  const ids = orders.map((o) => String(o.id));
  const { rows: items } = await query<Record<string, unknown>>(
    `SELECT oi.id,
            oi.order_id,
            oi.product_id,
            oi.quantity,
            oi.unit_price,
            oi.subtotal,
            oi.created_at,
            json_build_object(
              'id', p.id,
              'name', p.name,
              'sku', p.sku,
              'category', p.category
            ) AS products
       FROM order_items oi
       INNER JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ANY($1::uuid[])`,
    [ids],
  );

  const itemsByOrder = new Map<string, Record<string, unknown>[]>();
  for (const raw of items) {
    const oid = String(raw.order_id);
    if (!itemsByOrder.has(oid)) itemsByOrder.set(oid, []);
    const { products, ...rest } = raw;
    itemsByOrder.get(oid)!.push({ ...rest, products });
  }

  return orders.map((o) => ({
    ...mapOrderRow(o),
    items: itemsByOrder.get(String(o.id)) ?? [],
  }));
}

/** Finance transactions with vendor display fields. */
export async function fetchTransactionsWithVendors(scope: VendorScope): Promise<unknown[]> {
  const params: unknown[] = [];
  let sql = `
    SELECT t.*,
      json_build_object(
        'id', v.id,
        'business_name', v.business_name,
        'contact_email', v.contact_email
      ) AS vendors
    FROM transactions t
    INNER JOIN vendors v ON v.id = t.vendor_id
  `;
  const vw = vendorWhere(scope, params, 't');
  if (vw) sql += ` WHERE ${vw}`;
  sql += ` ORDER BY t.created_at DESC LIMIT 5000`;

  const { rows } = await query<Record<string, unknown>>(sql, params);
  return rows.map((r) => ({
    ...r,
    amount: parseNum(r.amount),
  }));
}

export async function fetchPayoutRequestsWithVendors(): Promise<unknown[]> {
  const { rows } = await query<Record<string, unknown>>(
    `SELECT pr.*,
      json_build_object(
        'id', v.id,
        'business_name', v.business_name,
        'contact_email', v.contact_email
      ) AS vendors
     FROM payout_requests pr
     INNER JOIN vendors v ON v.id = pr.vendor_id
     ORDER BY pr.created_at DESC NULLS LAST, pr.request_date DESC NULLS LAST
     LIMIT 5000`,
  );
  return rows.map((r) => ({
    ...r,
    amount: parseNum(r.amount),
    platform_fee: parseNum(r.platform_fee),
    net_amount: parseNum(r.net_amount),
  }));
}

export async function fetchPlatformFeesWithVendors(): Promise<unknown[]> {
  const { rows } = await query<Record<string, unknown>>(
    `SELECT pf.*,
      json_build_object(
        'id', v.id,
        'business_name', v.business_name
      ) AS vendors
     FROM platform_fees pf
     INNER JOIN vendors v ON v.id = pf.vendor_id
     ORDER BY pf.created_at DESC NULLS LAST
     LIMIT 5000`,
  );
  return rows.map((r) => ({
    ...r,
    fee_percentage: parseNum(r.fee_percentage),
  }));
}

export async function fetchShippingLabelsWithOrdersAndVendors(opts: {
  carrierEq?: string | null;
}): Promise<unknown[]> {
  const params: unknown[] = [];
  let sql = `
    SELECT sl.*,
      json_build_object(
        'order_number', o.order_number,
        'customer_name', o.customer_name
      ) AS orders,
      json_build_object(
        'business_name', v.business_name
      ) AS vendors
    FROM shipping_labels sl
    INNER JOIN orders o ON o.id = sl.order_id
    INNER JOIN vendors v ON v.id = sl.vendor_id
  `;
  const carrier = opts.carrierEq;
  if (carrier && carrier !== 'all') {
    params.push(carrier);
    sql += ` WHERE sl.carrier = $${params.length}`;
  }
  sql += ` ORDER BY sl.created_at DESC NULLS LAST LIMIT 5000`;

  const { rows } = await query<Record<string, unknown>>(sql, params);
  return rows.map((r) => ({
    ...r,
    cost: parseNum(r.cost),
  }));
}

export async function fetchReturnsWithVendorAndOrders(opts: { statusEq?: string | null }): Promise<unknown[]> {
  const params: unknown[] = [];
  let sql = `
    SELECT r.*,
      json_build_object(
        'id', v.id,
        'business_name', v.business_name
      ) AS vendors,
      json_build_object(
        'order_number', o.order_number
      ) AS orders
    FROM returns r
    INNER JOIN vendors v ON v.id = r.vendor_id
    INNER JOIN orders o ON o.id = r.order_id
  `;
  const st = opts.statusEq;
  if (st && st !== 'all') {
    params.push(st);
    sql += ` WHERE r.status = $${params.length}`;
  }
  sql += ` ORDER BY r.created_at DESC NULLS LAST LIMIT 5000`;

  const { rows } = await query<Record<string, unknown>>(sql, params);
  return rows.map((r) => ({
    ...r,
    return_amount: parseNum(r.return_amount),
    restocking_fee: parseNum(r.restocking_fee),
  }));
}

export async function fetchAdminInventoryWithRelations(): Promise<unknown[]> {
  const { rows } = await query<Record<string, unknown>>(
    `SELECT i.*,
      json_build_object(
        'id', v.id,
        'business_name', v.business_name,
        'contact_email', v.contact_email
      ) AS vendors,
      json_build_object(
        'id', p.id,
        'name', p.name,
        'sku', p.sku,
        'category', p.category,
        'price', p.price
      ) AS products
     FROM inventory i
     INNER JOIN vendors v ON v.id = i.vendor_id
     INNER JOIN products p ON p.id = i.product_id
     ORDER BY i.updated_at DESC NULLS LAST
     LIMIT 5000`,
  );
  return rows.map((r) => ({
    ...r,
    quantity: typeof r.quantity === 'number' ? r.quantity : parseInt(String(r.quantity), 10) || 0,
    reserved_quantity:
      typeof r.reserved_quantity === 'number' ? r.reserved_quantity : parseInt(String(r.reserved_quantity), 10) || 0,
    low_stock_threshold:
      typeof r.low_stock_threshold === 'number'
        ? r.low_stock_threshold
        : parseInt(String(r.low_stock_threshold), 10) || 0,
  }));
}

export async function fetchVendorInventoryWithProducts(vendorId: string): Promise<unknown[]> {
  const { rows } = await query<Record<string, unknown>>(
    `SELECT i.*,
      json_build_object(
        'name', p.name,
        'sku', p.sku
      ) AS products
     FROM inventory i
     INNER JOIN products p ON p.id = i.product_id
     WHERE i.vendor_id = $1::uuid
     ORDER BY i.updated_at DESC NULLS LAST
     LIMIT 2000`,
    [vendorId],
  );
  return rows.map((r) => ({
    ...r,
    quantity: typeof r.quantity === 'number' ? r.quantity : parseInt(String(r.quantity), 10) || 0,
    reserved_quantity:
      typeof r.reserved_quantity === 'number' ? r.reserved_quantity : parseInt(String(r.reserved_quantity), 10) || 0,
    low_stock_threshold:
      typeof r.low_stock_threshold === 'number'
        ? r.low_stock_threshold
        : parseInt(String(r.low_stock_threshold), 10) || 0,
  }));
}

export async function fetchVendorShipmentsWithOrderInfo(vendorId: string): Promise<unknown[]> {
  const { rows } = await query<Record<string, unknown>>(
    `SELECT s.*,
      json_build_object(
        'order_number', o.order_number,
        'customer_name', o.customer_name
      ) AS orders
     FROM shipments s
     INNER JOIN orders o ON o.id = s.order_id
     WHERE s.vendor_id = $1::uuid
     ORDER BY s.created_at DESC NULLS LAST
     LIMIT 2000`,
    [vendorId],
  );
  return rows;
}

export async function fetchAdminShipmentsWithRelations(opts: { statusEq?: string | null }): Promise<unknown[]> {
  const params: unknown[] = [];
  let sql = `
    SELECT s.*,
      json_build_object(
        'order_number', o.order_number,
        'customer_name', o.customer_name,
        'total_amount', o.total_amount
      ) AS orders,
      json_build_object(
        'business_name', v.business_name
      ) AS vendors
    FROM shipments s
    INNER JOIN orders o ON o.id = s.order_id
    INNER JOIN vendors v ON v.id = s.vendor_id
  `;
  const st = opts.statusEq;
  if (st && st !== 'all') {
    params.push(st);
    sql += ` WHERE s.status = $${params.length}`;
  }
  sql += ` ORDER BY s.created_at DESC NULLS LAST LIMIT 5000`;

  const { rows } = await query<Record<string, unknown>>(sql, params);
  return rows.map((r) => {
    const orders = r.orders as Record<string, unknown> | null;
    const nextOrders =
      orders && typeof orders === 'object'
        ? { ...orders, total_amount: parseNum(orders.total_amount) }
        : orders;
    return { ...r, orders: nextOrders };
  });
}
