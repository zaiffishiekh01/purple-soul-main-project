import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { isDashboardAdmin } from '@/src/lib/server/dashboard-access';
import { fetchPlatformFeesWithVendors } from '@/src/lib/server/dashboard-relational-data';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isDashboardAdmin(userId);
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
    }

    const data = await fetchPlatformFeesWithVendors();
    return NextResponse.json({ data, error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load platform fees';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
