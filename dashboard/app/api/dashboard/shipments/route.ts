import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { isDashboardAdmin, resolveVendorScope } from '@/src/lib/server/dashboard-access';
import {
  fetchAdminShipmentsWithRelations,
  fetchVendorShipmentsWithOrderInfo,
} from '@/src/lib/server/dashboard-relational-data';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const scopeParam = url.searchParams.get('scope') ?? 'vendor';
    const statusEq = url.searchParams.get('statusEq');
    const admin = await isDashboardAdmin(userId);

    if (scopeParam === 'admin') {
      if (!admin) {
        return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
      }
      const data = await fetchAdminShipmentsWithRelations({ statusEq });
      return NextResponse.json({ data, error: null });
    }

    if (scopeParam !== 'vendor') {
      return NextResponse.json({ data: null, error: 'Invalid scope' }, { status: 400 });
    }

    const vendorIdParam = url.searchParams.get('vendorId');
    const scope = await resolveVendorScope({
      userId,
      isAdmin: admin,
      requestedVendorId: vendorIdParam,
    });
    if (scope.kind === 'admin_all') {
      return NextResponse.json(
        { data: null, error: 'vendorId is required for vendor shipments when acting as admin' },
        { status: 400 },
      );
    }

    const data = await fetchVendorShipmentsWithOrderInfo(scope.vendorId);
    return NextResponse.json({ data, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load shipments';
    const status =
      message === 'NO_VENDOR_PROFILE' || message === 'VENDOR_SCOPE_FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ data: null, error: message }, { status });
  }
}
