import { createClient } from '@/lib/supabase/client';

export type AuditAction =
  | 'user.login.success'
  | 'user.login.failed'
  | 'user.logout'
  | 'user.register'
  | 'user.password.change'
  | 'user.password.reset'
  | 'user.mfa.enroll'
  | 'user.mfa.verify'
  | 'user.email.verify'
  | 'role.assign'
  | 'role.revoke'
  | 'permission.grant'
  | 'permission.revoke'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.suspend'
  | 'user.activate'
  | 'vendor.create'
  | 'vendor.update'
  | 'vendor.approve'
  | 'vendor.reject'
  | 'vendor.suspend'
  | 'vendor.activate'
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'product.activate'
  | 'product.deactivate'
  | 'inventory.update'
  | 'inventory.bulk.update'
  | 'order.create'
  | 'order.update'
  | 'order.cancel'
  | 'order.status.change'
  | 'shipment.create'
  | 'shipment.update'
  | 'shipment.label.create'
  | 'return.create'
  | 'return.approve'
  | 'return.reject'
  | 'refund.create'
  | 'refund.process'
  | 'payment.create'
  | 'payment.refund'
  | 'payout.create'
  | 'payout.execute'
  | 'fee_waiver.create'
  | 'settings.update'
  | 'category.create'
  | 'category.update'
  | 'category.delete'
  | 'admin.action';

export interface AuditLogOptions {
  userId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  status?: 'success' | 'failure';
  errorMessage?: string;
}

export async function logAuditEvent(options: AuditLogOptions): Promise<string | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: options.userId || null,
        action: options.action,
        resource_type: options.resourceType,
        resource_id: options.resourceId || null,
        details: options.details || {},
        ip_address: options.ipAddress || null,
        user_agent: options.userAgent || null,
        session_id: options.sessionId || null,
        status: options.status || 'success',
        error_message: options.errorMessage || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log audit event:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to log audit event:', error);
    return null;
  }
}

export async function addAuditContext(
  auditLogId: string,
  key: string,
  value: string
): Promise<void> {
  const supabase = createClient();

  try {
    await supabase.from('audit_log_contexts').insert({
      audit_log_id: auditLogId,
      key,
      value,
    });
  } catch (error) {
    console.error('Failed to add audit context:', error);
  }
}

export function getClientIP(request: Request): string | undefined {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    return undefined;
  } catch (error) {
    // Headers not available in this context
    return undefined;
  }
}

export function getUserAgent(request: Request): string | undefined {
  try {
    return request.headers.get('user-agent') || undefined;
  } catch (error) {
    // Headers not available in this context
    return undefined;
  }
}
