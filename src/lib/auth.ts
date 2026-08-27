import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import type { Role } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Телефон и пароль',
      credentials: {
        phone: { label: 'Телефон', type: 'text' },
        password: { label: 'Пароль', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.password) return null;
        const phone = normalizePhone(credentials.phone);
        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user?.passwordHash) return null;
        if (user.status === 'BLOCKED') throw new Error('Аккаунт заблокирован');
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
        return { id: user.id, name: user.name, email: user.email ?? undefined, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid as string;
        (session.user as any).role = token.role as Role;
      }
      return session;
    }
  }
};

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) return '+7' + digits.slice(1);
  if (digits.length === 11 && digits.startsWith('7')) return '+' + digits;
  if (digits.length === 10) return '+7' + digits;
  return '+' + digits;
}

export type SessionUser = { id: string; name?: string | null; role: Role };

export async function currentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;
  return u?.id ? { id: u.id, name: u.name, role: u.role } : null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') throw new Error('FORBIDDEN');
  return user;
}
