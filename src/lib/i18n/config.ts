// Три языка интерфейса. Русский — базовый словарь и источник правды по ключам,
// казахский и английский обязаны его повторять (проверяется типом Dictionary).

export const LOCALES = ['kk', 'ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ru';
export const LOCALE_COOKIE = 'qonys_locale';
export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_META: Record<Locale, { label: string; short: string; htmlLang: string; ogLocale: string; intl: string }> = {
  kk: { label: 'Қазақша', short: 'KK', htmlLang: 'kk', ogLocale: 'kk_KZ', intl: 'kk-KZ' },
  ru: { label: 'Русский', short: 'RU', htmlLang: 'ru', ogLocale: 'ru_KZ', intl: 'ru-KZ' },
  en: { label: 'English', short: 'EN', htmlLang: 'en', ogLocale: 'en_US', intl: 'en-US' }
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Разбор Accept-Language: kk-KZ,kk;q=0.9,ru;q=0.8 → kk */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { tag: tag.toLowerCase().split('-')[0], q: q ? Number(q.split('=')[1]) : 1 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (isLocale(tag)) return tag;
  }
  return null;
}

/** Locale в БД хранится как enum KK | RU | EN */
export const toDbLocale = (l: Locale) => l.toUpperCase() as 'KK' | 'RU' | 'EN';
export const fromDbLocale = (l: string | null | undefined): Locale =>
  isLocale(l?.toLowerCase()) ? (l!.toLowerCase() as Locale) : DEFAULT_LOCALE;
