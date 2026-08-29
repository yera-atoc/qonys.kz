import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { LOCALE_COOKIE, LOCALE_MAX_AGE, isLocale, toDbLocale } from '@/lib/i18n';

// Куку клиент ставит сам (мгновенный отклик). Здесь мы её подтверждаем
// httpOnly-версией и сохраняем язык в профиль, чтобы он ехал за аккаунтом.
export async function POST(req: Request) {
  const { locale } = await req.json().catch(() => ({ locale: null }));
  if (!isLocale(locale)) {
    return NextResponse.json({ error: 'UNKNOWN_LOCALE' }, { status: 400 });
  }

  const me = await currentUser();
  if (me) {
    await prisma.user.update({ where: { id: me.id }, data: { locale: toDbLocale(locale) } });
  }

  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_MAX_AGE,
    sameSite: 'lax'
  });
  return res;
}
