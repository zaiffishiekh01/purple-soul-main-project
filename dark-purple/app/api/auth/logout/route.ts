import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { revokeSession } from '@/lib/auth/session';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { logAuditEvent, getClientIP, getUserAgent } from '@/lib/auth/audit';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.substring(7);

      if (!token) {
        return NextResponse.json(
          { error: 'No token provided' },
          { status: 400 }
        );
      }

      const payload = await verifyAccessToken(token);

      if (user.sessionId) {
        await revokeSession(user.sessionId);
      }

      await logAuditEvent({
        userId: user.userId,
        action: 'user.logout',
        resourceType: 'user',
        resourceId: user.userId,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        sessionId: user.sessionId,
      });

      return NextResponse.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
