import { pool } from '@/src/lib/server/db';
import { ensureAuthSchema, hashPassword } from '@/src/lib/server/auth';

const MIN_PASSWORD_LENGTH = 8;

export type RegisterVendorResult =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; status: number; message: string };

/**
 * Creates `auth.users` + a pending `vendors` row in one DB transaction.
 * Does not require NextAuth session (used from public registration endpoint).
 */
export async function registerVendorAccount(
  emailRaw: string | undefined,
  passwordRaw: string | undefined,
): Promise<RegisterVendorResult> {
  if (!emailRaw || !passwordRaw) {
    return { ok: false, status: 400, message: 'Email and password are required' };
  }

  const email = String(emailRaw).trim().toLowerCase();
  const password = String(passwordRaw);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, status: 400, message: 'Invalid email address' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      status: 400,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }

  await ensureAuthSchema();
  const encryptedPassword = hashPassword(password);
  const businessName = email.split('@')[0] || 'Vendor';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query<{ id: string; email: string }>(
      `INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
       VALUES ($1, $2, now(), $3::jsonb)
       RETURNING id, email`,
      [email, encryptedPassword, JSON.stringify({ role: 'vendor' })],
    );

    const user = userResult.rows[0];
    if (!user) {
      await client.query('ROLLBACK');
      return { ok: false, status: 500, message: 'Could not create user' };
    }

    await client.query(
      `INSERT INTO vendors (user_id, business_name, contact_email, status, is_approved)
       VALUES ($1::uuid, $2, $3, 'pending', false)`,
      [user.id, businessName, email],
    );

    await client.query('COMMIT');
    return { ok: true, user: { id: user.id, email: user.email } };
  } catch (e: unknown) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore rollback errors */
    }
    const err = e as { code?: string; message?: string };
    if (err.code === '23505') {
      return { ok: false, status: 409, message: 'An account with this email already exists' };
    }
    console.error('[registerVendorAccount]', e);
    return {
      ok: false,
      status: 500,
      message: err.message || 'Registration failed',
    };
  } finally {
    client.release();
  }
}
