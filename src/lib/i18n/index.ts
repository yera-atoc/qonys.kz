import { ru, type Dictionary } from './dictionaries/ru';
import { kk } from './dictionaries/kk';
import { en } from './dictionaries/en';
import { DEFAULT_LOCALE, type Locale } from './config';

const DICTIONARIES: Record<Locale, Dictionary> = { kk, ru, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

export type { Dictionary };
export * from './config';
