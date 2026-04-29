import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getUserRolesAndPermissions, hasPermission } from '@/lib/auth/rbac';
import { logAuditEvent, getClientIP, getUserAgent } from '@/lib/auth/audit';
import { createClient } from '@/lib/supabase/client';

export interface VendorContext {
  userId: string;
  vendorId: string;
  email: string;
}

export async function withVendorAuth(
  request: NextRequest,
  handler: (ctx: VendorContext) => Promise<NextResponse>
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
    const canAccessVendors = hasPermission(userPermissions, 'vendors', 'read');

    if (!canAccessVendors) {
      await logAuditEvent({
        userId: authResult.user.userId,
        action: 'admin.action',
        resourceType: 'vendor_api',
        resourceId: undefined,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        status: 'failure',
        errorMessage: 'Insufficient permissions'
      });

      return NextResponse.json(
        { error: 'Forbidden: Vendor role required' },
        { status: 403 }
      );
    }

    const supabase = createClient();
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', authResult.user.userId)
      .maybeSingle();

    if (error || !vendor) {
      await logAuditEvent({
        userId: authResult.user.userId,
        action: 'admin.action',
        resourceType: 'vendor',
        resourceId: undefined,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        status: 'failure',
        errorMessage: 'Vendor profile not found'
      });

      return NextResponse.json(
        { error: 'Vendor profile not found' },
        { status: 404 }
      );
    }

    const ctx: VendorContext = {
      userId: authResult.user.userId,
      vendorId: vendor.id,
      email: authResult.user.email
    };

    return await handler(ctx);
  } catch (error) {
    console.error('Vendor auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function logVendorAction(
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
    ipAddress: getClientIP(request),
    userAgent: getUserAgent(request),
    status,
    errorMessage
  });
}
