import { NextRequest, NextResponse } from 'next/server';
import { registerVendorAccount } from '@/src/lib/server/register-vendor-account';

/**
 * Public vendor self-registration: creates auth user + pending vendor profile (no session required).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const result = await registerVendorAccount(body.email, body.password);

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({ user: result.user });
  } catch (e) {
    console.error('[POST /api/vendor/register]', e);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
