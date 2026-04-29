import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { createTokenPair } from '@/lib/auth/jwt';
import { createSession } from '@/lib/auth/session';
import { getUserRolesAndPermissions, assignRoleToUser } from '@/lib/auth/rbac';
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
    const { email, password, fullName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Use service role to bypass RLS for user creation
    const supabase = createClient(true);

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        full_name: fullName || null,
        password_hash: passwordHash,
        role: 'customer',
        status: 'active',
        email_verified: false,
      })
      .select('id, email, full_name, role, status')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    await assignRoleToUser(newUser.id, 'customer');

    const userPermissions = await getUserRolesAndPermissions(newUser.id);
    const permissionsArray = userPermissions.permissions.map(
      (p) => `${p.resource}:${p.action}`
    );

    const tokens = await createTokenPair({
      userId: newUser.id,
      email: newUser.email,
      roles: userPermissions.roles,
      permissions: permissionsArray,
    });

    const sessionId = await createSession(
      newUser.id,
      tokens.accessTokenId,
      tokens.refreshTokenId,
      tokens.expiresAt,
      tokens.refreshExpiresAt,
      getClientIP(),
      getUserAgent()
    );

    await logAuditEvent({
      userId: newUser.id,
      action: 'user.register',
      resourceType: 'user',
      resourceId: newUser.id,
      ipAddress: getClientIP(),
      userAgent: getUserAgent(),
      sessionId,
    });

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.full_name,
          role: newUser.role,
          roles: userPermissions.roles,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
