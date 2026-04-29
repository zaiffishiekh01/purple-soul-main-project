import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, createTokenPair } from '@/lib/auth/jwt';
import { getSessionByRefreshTokenId } from '@/lib/auth/session';
import { getUserRolesAndPermissions } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const payload = await verifyRefreshToken(refreshToken);

    const session = await getSessionByRefreshTokenId(payload.jti);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    if (session.revoked) {
      return NextResponse.json(
        { error: 'Session has been revoked' },
        { status: 401 }
      );
    }

    if (new Date() > session.refreshExpiresAt) {
      return NextResponse.json(
        { error: 'Refresh token has expired' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, status')
      .eq('id', session.userId)
      .maybeSingle();

    if (!user || userError || user.status !== 'active') {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    const userPermissions = await getUserRolesAndPermissions(user.id);
    const permissionsArray = userPermissions.permissions.map(
      (p) => `${p.resource}:${p.action}`
    );

    const tokens = await createTokenPair({
      userId: user.id,
      email: user.email,
      roles: userPermissions.roles,
      permissions: permissionsArray,
    });

    await supabase
      .from('sessions')
      .update({
        token_id: tokens.accessTokenId,
        refresh_token_id: tokens.refreshTokenId,
        expires_at: tokens.expiresAt.toISOString(),
        refresh_expires_at: tokens.refreshExpiresAt.toISOString(),
      })
      .eq('id', session.id);

    return NextResponse.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }
}
