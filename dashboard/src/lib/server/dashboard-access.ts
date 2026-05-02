import { query } from '@/src/lib/server/db';

export async function isDashboardAdmin(userId: string): Promise<boolean> {
  const { rows } = await query<{ ok: number }>(
    `SELECT 1 AS ok FROM admin_users WHERE user_id = $1::uuid LIMIT 1`,
    [userId],
  );
  return rows.length > 0;
}

export async function getVendorIdForUser(userId: string): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT id FROM vendors WHERE user_id = $1::uuid ORDER BY created_at ASC LIMIT 1`,
    [userId],
  );
  return rows[0]?.id ?? null;
}

export type VendorScope =
  | { kind: 'admin_all' }
  | { kind: 'scoped_vendor'; vendorId: string };

/**
 * Resolves which vendor rows a request may see.
 * - Admins: all vendors, or one vendor if `requestedVendorId` is set.
 * - Non-admins: only their own vendor row; `requestedVendorId` must match or be omitted.
 */
export async function resolveVendorScope(opts: {
  userId: string;
  isAdmin: boolean;
  requestedVendorId?: string | null;
}): Promise<VendorScope> {
  const { userId, isAdmin, requestedVendorId } = opts;
  if (isAdmin) {
    if (requestedVendorId) {
      return { kind: 'scoped_vendor', vendorId: requestedVendorId };
    }
    return { kind: 'admin_all' };
  }
  const own = await getVendorIdForUser(userId);
  if (!own) {
    throw new Error('NO_VENDOR_PROFILE');
  }
  if (requestedVendorId && requestedVendorId !== own) {
    throw new Error('VENDOR_SCOPE_FORBIDDEN');
  }
  return { kind: 'scoped_vendor', vendorId: own };
}
