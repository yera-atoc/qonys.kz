'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Logo } from './Logo';
import { LocaleSwitch } from './LocaleSwitch';
import { useI18n } from './I18nProvider';

export function Header() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [unread, setUnread] = useState(0);
  const role = (session?.user as any)?.role;

  const NAV = [
    { href: '/', label: t.nav.feed },
    { href: '/pricing', label: t.nav.pricing },
    { href: '/safety', label: t.nav.safety },
    { href: '/about', label: t.nav.about }
  ];

  // Счётчик непрочитанного. Опрашиваем раз в минуту и только для залогиненных —
  // на анонимной витрине лишних запросов быть не должно.
  useEffect(() => {
    if (!session) return;
    let stop = false;

    async function load() {
      try {
        const res = await fetch('/api/threads/unread', { cache: 'no-store' });
        if (res.ok && !stop) setUnread((await res.json()).count ?? 0);
      } catch {
        /* тихо игнорируем: бейдж не критичен */
      }
    }

    void load();
    const timer = setInterval(load, 60_000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [session, pathname]);

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
          <LocaleSwitch />

          {status === 'loading' ? (
            <div className="skeleton h-11 w-28 rounded-full" />
          ) : session ? (
            <>
              <Link
                href="/cabinet/chat"
                className="relative hidden text-[15px] text-muted transition hover:text-ink sm:block"
              >
                {t.nav.chat}
                {unread > 0 && (
                  <span className="absolute -right-4 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[11px] font-semibold text-ink">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </Link>
              {(role === 'ADMIN' || role === 'MODERATOR') && (
                <Link href="/admin" className="hidden text-[15px] text-muted transition hover:text-ink lg:block">
                  {t.nav.admin}
                </Link>
              )}
              <Link href="/cabinet" className="hidden text-[15px] text-muted transition hover:text-ink sm:block">
                {t.nav.cabinet}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hidden text-[15px] text-muted transition hover:text-ink lg:block"
              >
                {t.nav.logout}
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden text-[15px] text-muted transition hover:text-ink sm:block">
              {t.nav.login}
            </Link>
          )}

          <Link href="/post" className="btn-primary btn-sm sm:px-6 sm:py-3 sm:text-[15px]">
            {t.nav.post}
          </Link>

          <button
            onClick={() => setMenu((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line md:hidden"
            aria-label={t.nav.menu}
            aria-expanded={menu}
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
                <Link href="/cabinet/chat" onClick={() => setMenu(false)} className="py-3 text-[15px] font-medium">
                  {t.nav.chat}
                  {unread > 0 && <span className="ml-2 text-brand">{unread}</span>}
                </Link>
                <Link href="/cabinet" onClick={() => setMenu(false)} className="py-3 text-[15px] font-medium">
                  {t.nav.cabinet}
                </Link>
                <Link href="/cabinet/support" onClick={() => setMenu(false)} className="py-3 text-[15px] text-muted">
                  {t.nav.support}
                </Link>
                {(role === 'ADMIN' || role === 'MODERATOR') && (
                  <Link href="/admin" onClick={() => setMenu(false)} className="py-3 text-[15px] font-medium">
                    {t.nav.admin}
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="py-3 text-left text-[15px] text-muted">
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenu(false)} className="py-3 text-[15px] font-medium">
                {t.nav.login}
              </Link>
            )}
            <div className="my-2 border-t border-line" />
            <div className="py-2">
              <LocaleSwitch compact />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
