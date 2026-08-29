// Серверный модуль. Отдельный пакет server-only не тянем: next/headers сам
// падает при импорте из клиентского компонента, а список зависимостей
// остаётся коротким.
import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, localeFromAcceptLanguage, type Locale } from './config';
import { getDictionary, type Dictionary } from './index';

/**
 * Порядок определения языка:
 * 1. Cookie qonys_locale — явный выбор пользователя, побеждает всегда
 * 2. Accept-Language — разумный дефолт для первого визита
 * 3. Русский
 */
export function getLocale(): Locale {
  const fromCookie = cookies().get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  return localeFromAcceptLanguage(headers().get('accept-language')) ?? DEFAULT_LOCALE;
}

export function getT(): { locale: Locale; t: Dictionary } {
  const locale = getLocale();
  return { locale, t: getDictionary(locale) };
}
