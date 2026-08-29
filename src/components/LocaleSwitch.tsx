'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALES, LOCALE_COOKIE, LOCALE_MAX_AGE, LOCALE_META, type Locale } from '@/lib/i18n';
import { useI18n } from './I18nProvider';

export function LocaleSwitch({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function pick(next: Locale) {
    setOpen(false);
    if (next === locale) return;

    // Мгновенный отклик без круга через сервер: кука + refresh RSC-дерева
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_MAX_AGE}; samesite=lax`;
    document.documentElement.lang = LOCALE_META[next].htmlLang;

    // Залогиненным сохраняем выбор в профиль, чтобы язык ехал за аккаунтом
    void fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: next })
    }).catch(() => {});

    startTransition(() => router.refresh());
  }

  if (compact) {
    return (
      <div className="flex gap-1" role="group" aria-label={t.common.language}>
        {LOCALES.map((code) => (
          <button
            key={code}
            onClick={() => pick(code)}
            aria-current={code === locale}
            className={`rounded-lg px-2 py-1 text-xs transition ${
              code === locale ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {LOCALE_META[code].short}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.common.language}
        className="flex h-10 items-center gap-1.5 rounded-full border border-line px-3 text-[13px] font-medium text-muted transition hover:border-ink/25 hover:text-ink"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="10" cy="10" r="7.5" />
          <path d="M2.5 10h15M10 2.5c2 2.4 2 12.6 0 15M10 2.5c-2 2.4-2 12.6 0 15" strokeLinecap="round" />
        </svg>
        {LOCALE_META[locale].short}
      </button>

      {open && (
        <>
          <button className="fixed inset-0 z-40 cursor-default" aria-hidden onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-line bg-white py-1 shadow-lg"
          >
            {LOCALES.map((code) => (
              <li key={code}>
                <button
                  role="option"
                  aria-selected={code === locale}
                  onClick={() => pick(code)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-card ${
                    code === locale ? 'font-medium text-ink' : 'text-muted'
                  }`}
                >
                  {LOCALE_META[code].label}
                  {code === locale && (
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
