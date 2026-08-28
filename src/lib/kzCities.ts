// Города Казахстана — справочник для селектора города и карты.
// Координаты заданы только для крупных городов (мгновенное центрирование карты
// без обращения к геокодеру). Для остальных городов центр карты определяется
// на лету через геокодер 2ГИС (см. src/components/ListingsMap.tsx).

export type KzCity = {
  slug: string;
  name: string;
  region: string;
  lat?: number;
  lng?: number;
};

export const KZ_CITIES: KzCity[] = [
  // Города республиканского значения
  { slug: 'astana', name: 'Астана', region: 'Столица', lat: 51.1694, lng: 71.4491 },
  { slug: 'almaty', name: 'Алматы', region: 'Город респ. значения', lat: 43.2389, lng: 76.8897 },
  { slug: 'shymkent', name: 'Шымкент', region: 'Город респ. значения', lat: 42.3417, lng: 69.5901 },

  // Областные центры
  { slug: 'aktau', name: 'Актау', region: 'Мангистауская область', lat: 43.6511, lng: 51.1989 },
  { slug: 'aktobe', name: 'Актобе', region: 'Актюбинская область', lat: 50.2839, lng: 57.1670 },
  { slug: 'atyrau', name: 'Атырау', region: 'Атырауская область', lat: 47.1164, lng: 51.8830 },
  { slug: 'karaganda', name: 'Караганда', region: 'Карагандинская область', lat: 49.8047, lng: 73.1094 },
  { slug: 'kokshetau', name: 'Кокшетау', region: 'Акмолинская область', lat: 53.2833, lng: 69.3833 },
  { slug: 'kostanay', name: 'Костанай', region: 'Костанайская область', lat: 53.2144, lng: 63.6246 },
  { slug: 'kyzylorda', name: 'Кызылорда', region: 'Кызылординская область', lat: 44.8479, lng: 65.4999 },
  { slug: 'pavlodar', name: 'Павлодар', region: 'Павлодарская область', lat: 52.2871, lng: 76.9674 },
  { slug: 'petropavlovsk', name: 'Петропавловск', region: 'Северо-Казахстанская область', lat: 54.8756, lng: 69.1628 },
  { slug: 'semey', name: 'Семей', region: 'Абайская область', lat: 50.4111, lng: 80.2275 },
  { slug: 'taldykorgan', name: 'Талдыкорган', region: 'Жетысуская область', lat: 45.0161, lng: 78.3661 },
  { slug: 'taraz', name: 'Тараз', region: 'Жамбылская область', lat: 42.9000, lng: 71.3667 },
  { slug: 'turkestan', name: 'Туркестан', region: 'Туркестанская область', lat: 43.3017, lng: 68.2517 },
  { slug: 'uralsk', name: 'Уральск', region: 'Западно-Казахстанская область', lat: 51.2333, lng: 51.3667 },
  { slug: 'ust-kamenogorsk', name: 'Усть-Каменогорск', region: 'Восточно-Казахстанская область', lat: 49.9481, lng: 82.6275 },
  { slug: 'konaev', name: 'Конаев', region: 'Алматинская область', lat: 43.8783, lng: 77.0644 },
  { slug: 'zhezkazgan', name: 'Жезказган', region: 'Улытауская область', lat: 47.7833, lng: 67.7000 },

  // Крупные и средние города областного подчинения
  { slug: 'temirtau', name: 'Темиртау', region: 'Карагандинская область', lat: 50.0546, lng: 72.9646 },
  { slug: 'ekibastuz', name: 'Экибастуз', region: 'Павлодарская область', lat: 51.7250, lng: 75.3250 },
  { slug: 'rudny', name: 'Рудный', region: 'Костанайская область', lat: 52.9667, lng: 63.1167 },
  { slug: 'zhanaozen', name: 'Жанаозен', region: 'Мангистауская область', lat: 43.3417, lng: 52.8608 },
  { slug: 'baikonur', name: 'Байконур', region: 'Город респ. значения (РФ, аренда)', lat: 45.6180, lng: 63.3170 },
  { slug: 'kaskelen', name: 'Каскелен', region: 'Алматинская область' },
  { slug: 'koshi', name: 'Косшы', region: 'Акмолинская область' },
  { slug: 'talgar', name: 'Талгар', region: 'Алматинская область' },
  { slug: 'kapshagay', name: 'Капчагай', region: 'Алматинская область' },
  { slug: 'zharkent', name: 'Жаркент', region: 'Алматинская область' },
  { slug: 'tekeli', name: 'Текели', region: 'Алматинская область' },
  { slug: 'ushtobe', name: 'Уштобе', region: 'Алматинская область' },
  { slug: 'usharal', name: 'Ушарал', region: 'Алматинская область' },
  { slug: 'sarkand', name: 'Сарканд', region: 'Алматинская область' },
  { slug: 'esik', name: 'Есик', region: 'Алматинская область' },
  { slug: 'balkhash', name: 'Балхаш', region: 'Карагандинская область' },
  { slug: 'satpayev', name: 'Сатпаев', region: 'Карагандинская область' },
  { slug: 'shakhtinsk', name: 'Шахтинск', region: 'Карагандинская область' },
  { slug: 'saran', name: 'Сарань', region: 'Карагандинская область' },
  { slug: 'priozersk', name: 'Приозёрск', region: 'Карагандинская область' },
  { slug: 'karazhal', name: 'Каражал', region: 'Карагандинская область' },
  { slug: 'karkaralinsk', name: 'Каркаралинск', region: 'Карагандинская область' },
  { slug: 'abay', name: 'Абай', region: 'Карагандинская область' },
  { slug: 'kentau', name: 'Кентау', region: 'Туркестанская область' },
  { slug: 'saryagash', name: 'Сарыагаш', region: 'Туркестанская область' },
  { slug: 'arys', name: 'Арыс', region: 'Туркестанская область' },
  { slug: 'zhetysay', name: 'Жетысай', region: 'Туркестанская область' },
  { slug: 'shardara', name: 'Шардара', region: 'Туркестанская область' },
  { slug: 'lenger', name: 'Ленгер', region: 'Туркестанская область' },
  { slug: 'shu', name: 'Шу', region: 'Жамбылская область' },
  { slug: 'karatau', name: 'Каратау', region: 'Жамбылская область' },
  { slug: 'zhanatas', name: 'Жанатас', region: 'Жамбылская область' },
  { slug: 'aksay', name: 'Аксай', region: 'Западно-Казахстанская область' },
  { slug: 'lisakovsk', name: 'Лисаковск', region: 'Костанайская область' },
  { slug: 'zhitikara', name: 'Житикара', region: 'Костанайская область' },
  { slug: 'arkalyk', name: 'Аркалык', region: 'Костанайская область' },
  { slug: 'aralsk', name: 'Аральск', region: 'Кызылординская область' },
  { slug: 'kazalinsk', name: 'Казалинск', region: 'Кызылординская область' },
  { slug: 'fort-shevchenko', name: 'Форт-Шевченко', region: 'Мангистауская область' },
  { slug: 'aksu', name: 'Аксу', region: 'Павлодарская область' },
  { slug: 'kulsary', name: 'Кульсары', region: 'Атырауская область' },
  { slug: 'stepnogorsk', name: 'Степногорск', region: 'Акмолинская область' },
  { slug: 'shchuchinsk', name: 'Щучинск', region: 'Акмолинская область' },
  { slug: 'atbasar', name: 'Атбасар', region: 'Акмолинская область' },
  { slug: 'makinsk', name: 'Макинск', region: 'Акмолинская область' },
  { slug: 'akkol', name: 'Акколь', region: 'Акмолинская область' },
  { slug: 'yereymentau', name: 'Ерейментау', region: 'Акмолинская область' },
  { slug: 'esil', name: 'Есиль', region: 'Акмолинская область' },
  { slug: 'derzhavinsk', name: 'Державинск', region: 'Акмолинская область' },
  { slug: 'stepnyak', name: 'Степняк', region: 'Акмолинская область' },
  { slug: 'kandyagash', name: 'Кандыагаш', region: 'Актюбинская область' },
  { slug: 'shalkar', name: 'Шалкар', region: 'Актюбинская область' },
  { slug: 'khromtau', name: 'Хромтау', region: 'Актюбинская область' },
  { slug: 'alga', name: 'Алга', region: 'Актюбинская область' },
  { slug: 'emba', name: 'Эмба', region: 'Актюбинская область' },
  { slug: 'temir', name: 'Темир', region: 'Актюбинская область' },
  { slug: 'zhem', name: 'Жем', region: 'Актюбинская область' },
  { slug: 'ridder', name: 'Риддер', region: 'Восточно-Казахстанская область' },
  { slug: 'ayagoz', name: 'Аягоз', region: 'Абайская область' },
  { slug: 'zyryanovsk', name: 'Зыряновск', region: 'Восточно-Казахстанская область' },
  { slug: 'shemonaikha', name: 'Шемонаиха', region: 'Восточно-Казахстанская область' },
  { slug: 'zaysan', name: 'Зайсан', region: 'Абайская область' },
  { slug: 'kurchatov', name: 'Курчатов', region: 'Абайская область' },
  { slug: 'serebryansk', name: 'Серебрянск', region: 'Восточно-Казахстанская область' },
  { slug: 'charsk', name: 'Чарск', region: 'Абайская область' },
  { slug: 'tayynsha', name: 'Тайынша', region: 'Северо-Казахстанская область' },
  { slug: 'bulaevo', name: 'Булаево', region: 'Северо-Казахстанская область' },
  { slug: 'sergeyevka', name: 'Сергеевка', region: 'Северо-Казахстанская область' },
  { slug: 'mamlyutka', name: 'Мамлютка', region: 'Северо-Казахстанская область' }
];

export const KZ_CITIES_BY_REGION: Record<string, KzCity[]> = KZ_CITIES.reduce(
  (acc, city) => {
    (acc[city.region] ??= []).push(city);
    return acc;
  },
  {} as Record<string, KzCity[]>
);

export function getKzCity(slug: string): KzCity | undefined {
  return KZ_CITIES.find((c) => c.slug === slug);
}

// Дефолтный центр карты, если для города нет координат и геокодер ещё не ответил
export const KZ_DEFAULT_CENTER: [number, number] = [66.9237, 48.0196]; // географический центр РК
