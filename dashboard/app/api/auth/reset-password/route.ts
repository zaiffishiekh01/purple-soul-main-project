import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { hashPassword } from '@/src/lib/server/auth';
import { query } from '@/src/lib/server/db';

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await auth();
    const { email, newPassword } = (await request.json()) as { email?: string; newPassword?: string };

    if (!newPassword) {
      return NextResponse.json({ error: 'newPassword is required' }, { status: 400 });
    }

    if (sessionUser?.user?.id) {
      await query('UPDATE auth.users SET encrypted_password = $1, updated_at = now() WHERE id = $2', [
        hashPassword(newPassword),
        sessionUser.user.id,
      ]);
      return NextResponse.json({ ok: true });
    }

    if (!email) {
      return NextResponse.json({ error: 'email is required when not authenticated' }, { status: 400 });
    }

    await query('UPDATE auth.users SET encrypted_password = $1, updated_at = now() WHERE email = $2', [
      hashPassword(newPassword),
      email.toLowerCase(),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Password reset failed' },
      { status: 500 },
    );
  }
}

