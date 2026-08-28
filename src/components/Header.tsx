'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Logo } from './Logo';

const NAV = [
  { href: '/', label: 'Лента' },
  { href: '/pricing', label: 'Тарифы' },
  { href: '/safety', label: 'Безопасность' },
  { href: '/about', label: 'О сервисе' }
];

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const role = (session?.user as any)?.role;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="container-q flex h-[72px] items-center gap-6">
        <Logo />

        <nav className="mx-auto hidden items-center gap-8 md:flex">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[15px] transition-colors ${active ? 'font-medium text-ink' : 'text-muted hover:text-ink'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          {status === 'loading' ? (
            <div className="skeleton h-11 w-28 rounded-full" />
          ) : session ? (
            <>
              {(role === 'ADMIN' || role === 'MODERATOR') && (
                <Link href="/admin" className="hidden text-[15px] text-muted transition hover:text-ink lg:block">
                  Админка
                </Link>
              )}
              <Link href="/cabinet" className="hidden text-[15px] text-muted transition hover:text-ink sm:block">
                Кабинет
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hidden text-[15px] text-muted transition hover:text-ink lg:block"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden text-[15px] text-muted transition hover:text-ink sm:block">
              Войти
            </Link>
          )}

          <Link href="/post" className="btn-primary btn-sm sm:px-6 sm:py-3 sm:text-[15px]">
            Разместить
          </Link>

          <button
            onClick={() => setMenu((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line md:hidden"
            aria-label="Меню"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d={menu ? 'M5 5l10 10M15 5L5 15' : 'M3 6h14M3 10h14M3 14h14'} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {menu && (
        <div className="border-t border-line bg-white md:hidden">
          <nav className="container-q flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenu(false)}
                className="py-3 text-[15px] text-muted"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 border-t border-line" />
            {session ? (
              <>
                <Link href="/cabinet" onClick={() => setMenu(false)} className="py-3 text-[15px] font-medium">
                  Кабинет
                </Link>
                {(role === 'ADMIN' || role === 'MODERATOR') && (
                  <Link href="/admin" onClick={() => setMenu(false)} className="py-3 text-[15px] font-medium">
                    Админка
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="py-3 text-left text-[15px] text-muted">
                  Выйти
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenu(false)} className="py-3 text-[15px] font-medium">
                Войти
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
