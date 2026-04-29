import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { comparePassword } from '@/lib/auth/password';
import { createTokenPair } from '@/lib/auth/jwt';
import { createSession } from '@/lib/auth/session';
import { getUserRolesAndPermissions } from '@/lib/auth/rbac';
import { logAuditEvent } from '@/lib/auth/audit';

export async function POST(request: Request) {
  const getClientIP = () => {
    try {
      return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             undefined;
    } catch {
      return undefined;
    }
  };

  const getUserAgent = () => {
    try {
      return request.headers.get('user-agent') || undefined;
    } catch {
      return undefined;
    }
  };
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Use service role to bypass RLS for authentication
    const supabase = createClient(true);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, password_hash, role, status')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    console.log('User found:', !!user, 'Error:', userError);

    if (!user || userError) {
      await logAuditEvent({
        action: 'user.login.failed',
        resourceType: 'user',
        details: { email, reason: 'User not found' },
        ipAddress: getClientIP(),
        userAgent: getUserAgent(),
        status: 'failure',
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      await logAuditEvent({
        userId: user.id,
        action: 'user.login.failed',
        resourceType: 'user',
        resourceId: user.id,
        details: { reason: 'Account suspended or deleted' },
        ipAddress: getClientIP(),
        userAgent: getUserAgent(),
        status: 'failure',
      });

      return NextResponse.json(
        { error: 'Account is suspended or deleted' },
        { status: 403 }
      );
    }

    if (!user.password_hash) {
      await logAuditEvent({
        userId: user.id,
        action: 'user.login.failed',
        resourceType: 'user',
        resourceId: user.id,
        details: { reason: 'No password set' },
        ipAddress: getClientIP(),
        userAgent: getUserAgent(),
        status: 'failure',
      });

      return NextResponse.json(
        { error: 'Account not properly configured' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password_hash);

    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      await logAuditEvent({
        userId: user.id,
        action: 'user.login.failed',
        resourceType: 'user',
        resourceId: user.id,
        details: { reason: 'Invalid password' },
        ipAddress: getClientIP(),
        userAgent: getUserAgent(),
        status: 'failure',
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
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

    const sessionId = await createSession(
      user.id,
      tokens.accessTokenId,
      tokens.refreshTokenId,
      tokens.expiresAt,
      tokens.refreshExpiresAt,
      getClientIP(),
      getUserAgent()
    );

    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    await logAuditEvent({
      userId: user.id,
      action: 'user.login.success',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: getClientIP(),
      userAgent: getUserAgent(),
      sessionId,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        roles: userPermissions.roles,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
