import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { verifyPassword } from '@/src/lib/server/auth';
import { query } from '@/src/lib/server/db';

/**
 * Verifies the current user's password (for flows like change-password that must confirm identity).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword } = (await request.json()) as { currentPassword?: string };
    if (!currentPassword) {
      return NextResponse.json({ ok: false, error: 'currentPassword is required' }, { status: 400 });
    }

    const { rows } = await query<{ encrypted_password: string }>(
      `SELECT encrypted_password FROM auth.users WHERE id = $1 LIMIT 1`,
      [session.user.id],
    );
    const row = rows[0];
    if (!row || !verifyPassword(currentPassword, row.encrypted_password)) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 },
    );
  }
}
