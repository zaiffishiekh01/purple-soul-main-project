import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { isDashboardAdmin, resolveVendorScope } from '@/src/lib/server/dashboard-access';
import { fetchOrdersWithItemsAndProducts } from '@/src/lib/server/dashboard-relational-data';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isDashboardAdmin(userId);
    const url = new URL(request.url);
    const vendorId = url.searchParams.get('vendorId');

    const scope = await resolveVendorScope({
      userId,
      isAdmin: admin,
      requestedVendorId: vendorId,
    });

    const data = await fetchOrdersWithItemsAndProducts(scope);
    return NextResponse.json({ data, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load orders';
    const status =
      message === 'NO_VENDOR_PROFILE' || message === 'VENDOR_SCOPE_FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ data: null, error: message }, { status });
  }
}
