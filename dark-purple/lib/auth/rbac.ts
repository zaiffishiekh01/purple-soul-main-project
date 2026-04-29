import { createClient } from '@/lib/supabase/client';

export interface UserPermissions {
  userId: string;
  roles: string[];
  permissions: Array<{ resource: string; action: string }>;
}

export async function getUserRolesAndPermissions(userId: string): Promise<UserPermissions> {
  const supabase = createClient();

  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select(`
      role:roles (
        slug,
        role_permissions (
          permission:permissions (
            resource,
            action
          )
        )
      )
    `)
    .eq('user_id', userId);

  if (rolesError) {
    throw new Error(`Failed to fetch user roles: ${rolesError.message}`);
  }

  if (!userRoles || userRoles.length === 0) {
    return {
      userId,
      roles: [],
      permissions: [],
    };
  }

  const roles = userRoles.map((ur: any) => ur.role.slug);

  const permissionSet = new Set<string>();
  const permissions: Array<{ resource: string; action: string }> = [];

  userRoles.forEach((ur: any) => {
    ur.role.role_permissions.forEach((rp: any) => {
      const permission = rp.permission;
      const key = `${permission.resource}:${permission.action}`;

      if (!permissionSet.has(key)) {
        permissionSet.add(key);
        permissions.push({
          resource: permission.resource,
          action: permission.action,
        });
      }
    });
  });

  return {
    userId,
    roles,
    permissions,
  };
}

export function hasRole(userPermissions: UserPermissions, role: string): boolean {
  return userPermissions.roles.includes(role);
}

export function hasPermission(
  userPermissions: UserPermissions,
  resource: string,
  action: string
): boolean {
  return userPermissions.permissions.some(
    (p) => p.resource === resource && p.action === action
  );
}

export function hasAnyPermission(
  userPermissions: UserPermissions,
  checks: Array<{ resource: string; action: string }>
): boolean {
  return checks.some((check) =>
    hasPermission(userPermissions, check.resource, check.action)
  );
}

export function hasAllPermissions(
  userPermissions: UserPermissions,
  checks: Array<{ resource: string; action: string }>
): boolean {
  return checks.every((check) =>
    hasPermission(userPermissions, check.resource, check.action)
  );
}

export async function assignRoleToUser(
  userId: string,
  roleSlug: string,
  assignedBy?: string
): Promise<void> {
  const supabase = createClient();

  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('slug', roleSlug)
    .single();

  if (!role) {
    throw new Error(`Role not found: ${roleSlug}`);
  }

  const { error } = await supabase.from('user_roles').insert({
    user_id: userId,
    role_id: role.id,
    assigned_by: assignedBy,
  });

  if (error && error.code !== '23505') {
    throw new Error(`Failed to assign role: ${error.message}`);
  }
}

export async function removeRoleFromUser(userId: string, roleSlug: string): Promise<void> {
  const supabase = createClient();

  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('slug', roleSlug)
    .single();

  if (!role) {
    throw new Error(`Role not found: ${roleSlug}`);
  }

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', role.id);

  if (error) {
    throw new Error(`Failed to remove role: ${error.message}`);
  }
}
