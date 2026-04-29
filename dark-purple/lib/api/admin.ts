import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserRolesAndPermissions, hasPermission } from '@/lib/auth/rbac';
import { logAuditEvent, getClientIP, getUserAgent } from '@/lib/auth/audit';

export interface AdminContext {
  userId: string;
  email: string;
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (ctx: AdminContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const userPermissions = await getUserRolesAndPermissions(authResult.user.userId);
    const isAdmin = hasPermission(userPermissions, 'admin', 'manage');

    if (!isAdmin) {
      await logAuditEvent({
        userId: authResult.user.userId,
        action: 'admin.action',
        resourceType: 'admin_api',
        resourceId: undefined,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        status: 'failure',
        errorMessage: 'Insufficient permissions'
      });

      return NextResponse.json(
        { error: 'Forbidden: Admin role required' },
        { status: 403 }
      );
    }

    const ctx: AdminContext = {
      userId: authResult.user.userId,
      email: authResult.user.email
    };

    return await handler(ctx);
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function logAdminAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  request: NextRequest,
  status: 'success' | 'failure' = 'success',
  errorMessage?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'admin.action',
    resourceType,
    resourceId: resourceId || undefined,
    details: { action },
    ipAddress: getClientIP(request),
    userAgent: getUserAgent(request),
    status,
    errorMessage
  });
}
