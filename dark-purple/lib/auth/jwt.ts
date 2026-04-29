import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m';
const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const secret = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  sessionId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenId: string;
  refreshTokenId: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
}

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiry}`);

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const seconds = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  }[unit];

  return value * seconds!;
}

export async function createAccessToken(payload: JWTPayload): Promise<{ token: string; tokenId: string; expiresAt: Date }> {
  const tokenId = nanoid();
  const expirySeconds = parseExpiry(JWT_ACCESS_TOKEN_EXPIRY);
  const expiresAt = new Date(Date.now() + expirySeconds * 1000);

  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    roles: payload.roles,
    permissions: payload.permissions,
    sessionId: payload.sessionId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(tokenId)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .setSubject(payload.userId)
    .sign(secret);

  return { token, tokenId, expiresAt };
}

export async function createRefreshToken(userId: string): Promise<{ token: string; tokenId: string; expiresAt: Date }> {
  const tokenId = nanoid();
  const expirySeconds = parseExpiry(JWT_REFRESH_TOKEN_EXPIRY);
  const expiresAt = new Date(Date.now() + expirySeconds * 1000);

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(tokenId)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .setSubject(userId)
    .sign(secret);

  return { token, tokenId, expiresAt };
}

export async function createTokenPair(payload: JWTPayload): Promise<TokenPair> {
  const accessTokenResult = await createAccessToken(payload);
  const refreshTokenResult = await createRefreshToken(payload.userId);

  return {
    accessToken: accessTokenResult.token,
    refreshToken: refreshTokenResult.token,
    accessTokenId: accessTokenResult.tokenId,
    refreshTokenId: refreshTokenResult.tokenId,
    expiresAt: accessTokenResult.expiresAt,
    refreshExpiresAt: refreshTokenResult.expiresAt,
  };
}

export async function verifyAccessToken(token: string): Promise<JWTPayload & { jti: string }> {
  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.sub as string,
      email: payload.email as string,
      roles: payload.roles as string[],
      permissions: payload.permissions as string[],
      sessionId: payload.sessionId as string | undefined,
      jti: payload.jti as string,
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string; jti: string }> {
  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.sub as string,
      jti: payload.jti as string,
    };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}
