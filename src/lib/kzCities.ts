// Города Qonys. Осознанно ограничены четырьмя городами: мы открываем город
// только когда в нём есть районы, модерация и живые объявления. Пустой пункт
// в списке городов стоит дороже, чем его отсутствие.
//
// Чтобы открыть новый город: добавить запись сюда → добавить районы попадут
// в базу автоматически при `npm run db:seed`.

import type { Locale } from './i18n/config';

export type KzDistrict = {
  slug: string; // city-scoped: almaty-bostandyk
  ru: string;
  kk: string;
  en: string;
};

export type KzCity = {
  slug: string;
  ru: string;
  kk: string;
  en: string;
  lat: number;
  lng: number;
  zoom: number;
  districts: KzDistrict[];
};

export const KZ_CITIES: KzCity[] = [
  {
    slug: 'astana',
    ru: 'Астана',
    kk: 'Астана',
    en: 'Astana',
    lat: 51.1694,
    lng: 71.4491,
    zoom: 11,
    districts: [
      { slug: 'astana-esil', ru: 'Есильский', kk: 'Есіл ауданы', en: 'Esil' },
      { slug: 'astana-almaty', ru: 'Алматинский', kk: 'Алматы ауданы', en: 'Almaty' },
      { slug: 'astana-saryarka', ru: 'Сарыаркинский', kk: 'Сарыарқа ауданы', en: 'Saryarka' },
      { slug: 'astana-baikonyr', ru: 'Байконурский', kk: 'Байқоңыр ауданы', en: 'Baikonyr' },
      { slug: 'astana-nura', ru: 'Нуринский', kk: 'Нұра ауданы', en: 'Nura' }
    ]
  },
  {
    slug: 'almaty',
    ru: 'Алматы',
    kk: 'Алматы',
    en: 'Almaty',
    lat: 43.2389,
    lng: 76.8897,
    zoom: 11,
    districts: [
      { slug: 'almaty-bostandyk', ru: 'Бостандыкский', kk: 'Бостандық ауданы', en: 'Bostandyk' },
      { slug: 'almaty-medeu', ru: 'Медеуский', kk: 'Медеу ауданы', en: 'Medeu' },
      { slug: 'almaty-almaly', ru: 'Алмалинский', kk: 'Алмалы ауданы', en: 'Almaly' },
      { slug: 'almaty-auezov', ru: 'Ауэзовский', kk: 'Әуезов ауданы', en: 'Auezov' },
      { slug: 'almaty-nauryzbay', ru: 'Наурызбайский', kk: 'Наурызбай ауданы', en: 'Nauryzbay' },
      { slug: 'almaty-alatau', ru: 'Алатауский', kk: 'Алатау ауданы', en: 'Alatau' },
      { slug: 'almaty-turksib', ru: 'Турксибский', kk: 'Түрксіб ауданы', en: 'Turksib' },
      { slug: 'almaty-zhetysu', ru: 'Жетысуский', kk: 'Жетісу ауданы', en: 'Zhetysu' }
    ]
  },
  {
    slug: 'shymkent',
    ru: 'Шымкент',
    kk: 'Шымкент',
    en: 'Shymkent',
    lat: 42.3417,
    lng: 69.5901,
    zoom: 11,
    districts: [
      { slug: 'shymkent-al-farabi', ru: 'Аль-Фарабийский', kk: 'Әл-Фараби ауданы', en: 'Al-Farabi' },
      { slug: 'shymkent-abay', ru: 'Абайский', kk: 'Абай ауданы', en: 'Abay' },
      { slug: 'shymkent-yenbekshi', ru: 'Енбекшинский', kk: 'Еңбекші ауданы', en: 'Yenbekshi' },
      { slug: 'shymkent-karatau', ru: 'Каратауский', kk: 'Қаратау ауданы', en: 'Karatau' },
      { slug: 'shymkent-turan', ru: 'Туранский', kk: 'Тұран ауданы', en: 'Turan' }
    ]
  },
  {
    slug: 'karaganda',
    ru: 'Караганда',
    kk: 'Қарағанды',
    en: 'Karaganda',
    lat: 49.8047,
    lng: 73.1094,
    zoom: 11,
    districts: [
      { slug: 'karaganda-kazybek-bi', ru: 'Казыбекбийский', kk: 'Қазыбек би ауданы', en: 'Kazybek Bi' },
      { slug: 'karaganda-oktyabrsky', ru: 'Октябрьский', kk: 'Октябрь ауданы', en: 'Oktyabrsky' },
      { slug: 'karaganda-maykuduk', ru: 'Майкудук', kk: 'Майқұдық', en: 'Maykuduk' },
      { slug: 'karaganda-yugo-vostok', ru: 'Юго-Восток', kk: 'Оңтүстік-Шығыс', en: 'Yugo-Vostok' },
      { slug: 'karaganda-prishakhtinsk', ru: 'Пришахтинск', kk: 'Пришахтинск', en: 'Prishakhtinsk' }
    ]
  }
];

export const CITY_SLUGS = KZ_CITIES.map((c) => c.slug);
export const DEFAULT_CITY = 'almaty';

export function getKzCity(slug: string | null | undefined): KzCity | undefined {
  return KZ_CITIES.find((c) => c.slug === slug);
}

export function isKnownCity(slug: string | null | undefined): boolean {
  return Boolean(slug && CITY_SLUGS.includes(slug));
}

/** Название города на языке интерфейса */
export function cityName(slug: string | null | undefined, locale: Locale): string {
  const city = getKzCity(slug);
  return city ? city[locale] : '';
}

/** Все районы всех городов — источник правды для сида и валидации */
export const ALL_DISTRICTS = KZ_CITIES.flatMap((city) =>
  city.districts.map((d, i) => ({ ...d, city: city.slug, sort: i }))
);

export function districtName(
  district: { name: string; nameKk?: string | null; nameEn?: string | null } | null | undefined,
  locale: Locale
): string {
  if (!district) return '';
  if (locale === 'kk') return district.nameKk || district.name;
  if (locale === 'en') return district.nameEn || district.name;
  return district.name;
}

export const KZ_DEFAULT_CENTER: [number, number] = [76.8897, 43.2389]; // Алматы
