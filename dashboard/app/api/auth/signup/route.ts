import { NextRequest, NextResponse } from 'next/server';
import { registerVendorAccount } from '@/src/lib/server/register-vendor-account';

/** @deprecated Prefer `POST /api/vendor/register` — kept for older clients. */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as { email?: string; password?: string };
  const result = await registerVendorAccount(body.email, body.password);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({ user: result.user });
}

