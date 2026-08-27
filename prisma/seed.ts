import { PrismaClient, Role, ListingKind, HousingType, ListingStatus, Gender, Occupation, PromoType, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DISTRICTS = [
  'Бостандыкский', 'Медеуский', 'Алмалинский', 'Ауэзовский',
  'Наурызбайский', 'Алатауский', 'Турксибский', 'Жетысуский'
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/ский$/, '').replace(/[^a-zа-я0-9]+/gi, '-');

async function main() {
  // Районы Алматы
  for (const name of DISTRICTS) {
    await prisma.district.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), city: 'almaty' }
    });
  }

  // Тарифы для риелторов
  const plans = [
    { slug: 'start', title: 'Старт', price: 4900, listingLimit: 5, freeBumps: 4, freeTopDays: 0, sort: 1 },
    { slug: 'business', title: 'Бизнес', price: 12900, listingLimit: 25, freeBumps: 20, freeTopDays: 7, hasAnalytics: true, sort: 2 },
    { slug: 'pro', title: 'Про', price: 29900, listingLimit: 100, freeBumps: 100, freeTopDays: 30, hasAnalytics: true, hasBadge: true, sort: 3 }
  ];
  for (const p of plans) {
    await prisma.plan.upsert({ where: { slug: p.slug }, update: p, create: p });
  }

  // Пакеты продвижения
  const packages = [
    { type: PromoType.TOP, title: 'ТОП на 7 дней', days: 7, price: 2500, sort: 1 },
    { type: PromoType.TOP, title: 'ТОП на 14 дней', days: 14, price: 4200, sort: 2 },
    { type: PromoType.TOP, title: 'ТОП на 30 дней', days: 30, price: 7500, sort: 3 },
    { type: PromoType.URGENT, title: 'Метка «Срочно», 7 дней', days: 7, price: 1200, sort: 4 },
    { type: PromoType.HIGHLIGHT, title: 'Выделение цветом, 14 дней', days: 14, price: 1800, sort: 5 },
    { type: PromoType.BUMP, title: 'Поднятие в ленте', days: 1, price: 500, sort: 6 },
    { type: PromoType.PHOTO_PACK, title: 'Фотопакет до 20 фото, 30 дней', days: 30, price: 900, sort: 7 }
  ];
  for (const p of packages) {
    const exists = await prisma.promoPackage.findFirst({ where: { title: p.title } });
    if (!exists) await prisma.promoPackage.create({ data: p });
  }

  // Настройки платформы
  const settings: Record<string, string> = {
    'contact_unlock_price': '300',
    'free_listings_per_user': '2',
    'listing_ttl_days': '30',
    'moderation_auto_approve': 'false',
    'commission_percent': '0'
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  // Администратор
  const admin = await prisma.user.upsert({
    where: { phone: '+77000000001' },
    update: {},
    create: {
      phone: '+77000000001',
      email: 'admin@qonys.kz',
      name: 'Администратор',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      phoneVerified: true,
      passwordHash: await bcrypt.hash('admin12345', 10),
      wallet: { create: { balance: 0 } }
    }
  });

  // Демо-пользователи и объявления (из ленты Qonys)
  const demo = [
    { name: 'Айгерим', age: 24, gender: Gender.FEMALE, occ: Occupation.WORKING, kind: ListingKind.OFFER_ROOM, title: 'Отдельная комната в 2-комн., тихий двор', price: 95000, type: HousingType.SEPARATE_ROOM, rooms: 2, district: 'Бостандыкский', metro: 'Алатау' },
    { name: 'Данияр', age: 22, gender: Gender.MALE, occ: Occupation.STUDENT, kind: ListingKind.SEEK_ROOMMATE, title: 'Ищу соседа в 2-комн., Самал, бюджет до 120к', price: 110000, type: HousingType.SEPARATE_ROOM, rooms: 2, district: 'Медеуский', metro: null },
    { name: 'Аружан', age: 20, gender: Gender.FEMALE, occ: Occupation.STUDENT, kind: ListingKind.OFFER_ROOM, title: 'Койко-место в комнате, рядом с университетом', price: 45000, type: HousingType.BED_SPACE, rooms: 1, district: 'Алмалинский', metro: 'Абая' },
    { name: 'Ержан', age: 26, gender: Gender.MALE, occ: Occupation.WORKING, kind: ListingKind.SEEK_ROOMMATE, title: 'Айтишник 26 лет ищет соседа в 3-комн.', price: 130000, type: HousingType.SEPARATE_ROOM, rooms: 3, district: 'Ауэзовский', metro: 'Сайран' },
    { name: 'Мадина', age: 29, gender: Gender.FEMALE, occ: Occupation.WORKING, kind: ListingKind.OFFER_ROOM, title: 'Комната в новом ЖК, мебель новая', price: 150000, type: HousingType.SEPARATE_ROOM, rooms: 3, district: 'Бостандыкский', metro: 'Байконур' },
    { name: 'Жанель', age: 23, gender: Gender.FEMALE, occ: Occupation.WORKING, kind: ListingKind.SEEK_ROOMMATE, title: 'Ищу спокойную соседку, делим аренду пополам', price: 80000, type: HousingType.SHARED_ROOM, rooms: 2, district: 'Медеуский', metro: null },
    { name: 'Бекзат', age: 31, gender: Gender.MALE, occ: Occupation.WORKING, kind: ListingKind.OFFER_ROOM, title: 'Уютная комната в районе Орбита-3', price: 70000, type: HousingType.SEPARATE_ROOM, rooms: 2, district: 'Ауэзовский', metro: 'Алатау' },
    { name: 'Алишер', age: 19, gender: Gender.MALE, occ: Occupation.STUDENT, kind: ListingKind.SEEK_ROOMMATE, title: 'Двое студентов ищут третьего в 3-комн.', price: 60000, type: HousingType.BED_SPACE, rooms: 3, district: 'Алмалинский', metro: 'Жибек Жолы' }
  ];

  let i = 2;
  for (const d of demo) {
    const phone = `+7700000000${i++}`.slice(0, 12);
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        name: d.name,
        birthYear: new Date().getFullYear() - d.age,
        gender: d.gender,
        occupation: d.occ,
        status: UserStatus.ACTIVE,
        phoneVerified: true,
        passwordHash: await bcrypt.hash('demo12345', 10),
        wallet: { create: { balance: 5000, bonusBalance: 1000 } }
      }
    });

    const district = await prisma.district.findUnique({ where: { slug: slugify(d.district) } });
    const already = await prisma.listing.findFirst({ where: { title: d.title } });
    if (already) continue;

    await prisma.listing.create({
      data: {
        authorId: user.id,
        kind: d.kind,
        title: d.title,
        description:
          'Светлая комната, всё необходимое есть. Соседи спокойные, коммуналка делится поровну. Заезд по договорённости, залог обсуждаем.',
        price: d.price,
        housingType: d.type,
        rooms: d.rooms,
        districtId: district?.id,
        metro: d.metro,
        preferGender: d.gender,
        habits: ['не курю', 'без животных', 'тихий режим'],
        amenities: ['wi-fi', 'стиральная машина', 'мебель'],
        status: ListingStatus.ACTIVE,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 864e5),
        views: Math.floor(Math.random() * 400)
      }
    });
  }

  console.log('Готово. Админ: +77000000001 / admin12345');
  console.log(`Создан пользователь ${admin.name}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
