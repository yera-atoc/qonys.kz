'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Logo } from './Logo';

const NAV = [
  { href: '/', label: 'Лента' },
  { href: '/pricing', label: 'Тарифы' },
  { href: '/safety', label: 'Безопасность' },
  { href: '/about', label: 'О сервисе' }
];

export function Header() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur">
      <div className="container-q flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              {(role === 'ADMIN' || role === 'MODERATOR') && (
                <Link href="/admin" className="hidden text-sm text-muted hover:text-ink sm:block">
                  Админка
                </Link>
              )}
              <Link href="/cabinet" className="btn-ghost">
                Кабинет
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm text-muted hover:text-ink">
                Выйти
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-muted hover:text-ink">
              Войти
            </Link>
          )}
          <Link href="/post" className="btn-primary">
            Разместить
          </Link>
        </div>
      </div>
    </header>
  );
}
