'use client';

import { createContext, useContext } from 'react';
import { getDictionary, type Dictionary, type Locale } from '@/lib/i18n';

const I18nContext = createContext<{ locale: Locale; t: Dictionary } | null>(null);

export function I18nProvider({
  locale,
  children
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  // Словарь берём на клиенте по коду языка, а не тащим объект через пропсы:
  // так он попадает в общий бандл один раз, а не в каждый RSC-пейлоад.
  return <I18nContext.Provider value={{ locale, t: getDictionary(locale) }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n должен вызываться внутри <I18nProvider>');
  return ctx;
}
