import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { ensureAuthSchema, verifyPassword } from '@/src/lib/server/auth';
import { query } from '@/src/lib/server/db';

function authSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing AUTH_SECRET (or NEXTAUTH_SECRET / JWT_SECRET). Add it to your environment.');
  }
  return secret;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret(),
  trustHost: true,
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const emailRaw = credentials?.email;
        const passwordRaw = credentials?.password;
        if (!emailRaw || !passwordRaw) {
          return null;
        }

        await ensureAuthSchema();
        const email = String(emailRaw).toLowerCase();
        const password = String(passwordRaw);

        const { rows } = await query<{ id: string; email: string; encrypted_password: string }>(
          `SELECT id, email, encrypted_password FROM auth.users WHERE email = $1 LIMIT 1`,
          [email],
        );

        const row = rows[0];
        if (!row || !verifyPassword(password, row.encrypted_password)) {
          return null;
        }

        await query(`UPDATE auth.users SET last_sign_in_at = now(), updated_at = now() WHERE id = $1`, [row.id]);

        return { id: row.id, email: row.email };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.email = (token.email as string) ?? '';
      }
      return session;
    },
  },
});
