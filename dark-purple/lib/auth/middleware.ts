import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './jwt';
import { getSessionByTokenId } from './session';
import { hasPermission, hasRole } from './rbac';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    permissions: Array<{ resource: string; action: string }>;
    sessionId?: string;
  };
}

export async function requireAuth(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: {
    userId: string;
    email: string;
    roles: string[];
    permissions: Array<{ resource: string; action: string }>;
    sessionId?: string;
  };
  error?: string;
}> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or invalid authorization header',
    };
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verifyAccessToken(token);

    const session = await getSessionByTokenId(payload.jti);

    if (!session) {
      return {
        authenticated: false,
        error: 'Session not found',
      };
    }

    if (session.revoked) {
      return {
        authenticated: false,
        error: 'Session has been revoked',
      };
    }

    if (new Date() > session.expiresAt) {
      return {
        authenticated: false,
        error: 'Session has expired',
      };
    }

    const permissions = payload.permissions.map((p: string) => {
      const [resource, action] = p.split(':');
      return { resource, action };
    });

    return {
      authenticated: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles,
        permissions,
        sessionId: payload.sessionId,
      },
    };
  } catch (error) {
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}

export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async (request: NextRequest) => {
    const authResult = await requireAuth(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const hasRequiredRole = authResult.user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return null;
  };
}

export function requirePermission(resource: string, action: string) {
  return async (request: NextRequest) => {
    const authResult = await requireAuth(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const userHasPermission = authResult.user.permissions.some(
      (p) => p.resource === resource && p.action === action
    );

    if (!userHasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return null;
  };
}

export async function withAuth<T>(
  request: NextRequest,
  handler: (
    request: NextRequest,
    user: {
      userId: string;
      email: string;
      roles: string[];
      permissions: Array<{ resource: string; action: string }>;
      sessionId?: string;
    }
  ) => Promise<T>
): Promise<T | NextResponse> {
  const authResult = await requireAuth(request);

  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    );
  }

  return handler(request, authResult.user);
}
