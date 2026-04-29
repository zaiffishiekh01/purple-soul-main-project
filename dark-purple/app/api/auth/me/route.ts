import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const supabase = createClient();

      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, status, created_at, last_login_at')
        .eq('id', user.userId)
        .maybeSingle();

      if (!userData || error) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: {
          id: userData.id,
          email: userData.email,
          fullName: userData.full_name,
          role: userData.role,
          roles: user.roles,
          permissions: user.permissions,
          status: userData.status,
          createdAt: userData.created_at,
          lastLoginAt: userData.last_login_at,
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
