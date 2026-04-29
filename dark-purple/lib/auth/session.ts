import { createClient } from '@/lib/supabase/client';

export interface Session {
  id: string;
  userId: string;
  tokenId: string;
  refreshTokenId: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  revoked: boolean;
}

export async function createSession(
  userId: string,
  tokenId: string,
  refreshTokenId: string,
  expiresAt: Date,
  refreshExpiresAt: Date,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      token_id: tokenId,
      refresh_token_id: refreshTokenId,
      expires_at: expiresAt.toISOString(),
      refresh_expires_at: refreshExpiresAt.toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
      revoked: false,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return data.id;
}

export async function getSessionByTokenId(tokenId: string): Promise<Session | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('token_id', tokenId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    tokenId: data.token_id,
    refreshTokenId: data.refresh_token_id,
    expiresAt: new Date(data.expires_at),
    refreshExpiresAt: new Date(data.refresh_expires_at),
    ipAddress: data.ip_address,
    userAgent: data.user_agent,
    revoked: data.revoked,
  };
}

export async function getSessionByRefreshTokenId(refreshTokenId: string): Promise<Session | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('refresh_token_id', refreshTokenId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    tokenId: data.token_id,
    refreshTokenId: data.refresh_token_id,
    expiresAt: new Date(data.expires_at),
    refreshExpiresAt: new Date(data.refresh_expires_at),
    ipAddress: data.ip_address,
    userAgent: data.user_agent,
    revoked: data.revoked,
  };
}

export async function revokeSession(sessionId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('sessions')
    .update({ revoked: true })
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to revoke session: ${error.message}`);
  }
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('sessions')
    .update({ revoked: true })
    .eq('user_id', userId)
    .eq('revoked', false);

  if (error) {
    throw new Error(`Failed to revoke user sessions: ${error.message}`);
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  const supabase = createClient();

  const now = new Date().toISOString();

  const { error } = await supabase
    .from('sessions')
    .delete()
    .lt('refresh_expires_at', now);

  if (error) {
    throw new Error(`Failed to cleanup expired sessions: ${error.message}`);
  }
}
