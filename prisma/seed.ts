import { PrismaClient, Role, ListingKind, HousingType, ListingStatus, Gender, Occupation, PromoType, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ALL_DISTRICTS, KZ_CITIES } from '../src/lib/kzCities';

const prisma = new PrismaClient();

async function main() {
  // Районы четырёх городов. Источник правды — src/lib/kzCities.ts,
  // чтобы список в селекторе и список в базе не могли разъехаться.
  for (const d of ALL_DISTRICTS) {
    await prisma.district.upsert({
      where: { slug: d.slug },
      update: { name: d.ru, nameKk: d.kk, nameEn: d.en, city: d.city, sort: d.sort },
      create: { slug: d.slug, name: d.ru, nameKk: d.kk, nameEn: d.en, city: d.city, sort: d.sort }
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
    { name: 'Айгерим', age: 24, gender: Gender.FEMALE, occ: Occupation.WORKING, kind: ListingKind.OFFER_ROOM, title: 'Отдельная комната в 2-комн., тихий двор', price: 95000, type: HousingType.SEPARATE_ROOM, rooms: 2, district: 'almaty-bostandyk', metro: 'Алатау' },
    { name: 'Данияр', age: 22, gender: Gender.MALE, occ: Occupation.STUDENT, kind: ListingKind.SEEK_ROOMMATE, title: 'Ищу соседа в 2-комн., Самал, бюджет до 120к', price: 110000, type: HousingType.SEPARATE_ROOM, rooms: 2, district: 'almaty-medeu', metro: null },
    { name: 'Аружан', age: 20, gender: Gender.FEMALE, occ: Occupation.STUDENT, kind: ListingKind.OFFER_ROOM, title: 'Койко-место в комнате, рядом с университетом', price: 45000, type: HousingType.BED_SPACE, rooms: 1, district: 'almaty-almaly', metro: 'Абая' },
    { name: 'Ержан', age: 26, gender: Gender.MALE, occ: Occupation.WORKING, kind: ListingKind.SEEK_ROOMMATE, title: 'Айтишник 26 лет ищет соседа в 3-комн.', price: 130000, type: HousingType.SEPARATE_ROOM, rooms: 3, district: 'almaty-auezov', metro: 'Сайран' },
    { name: 'Мадина', age: 29, gender: Gender.FEMALE, occ: Occupation.WORKING, kind: ListingKind.OFFER_ROOM, title: 'Комната в новом ЖК, мебель новая', price: 150000, type: HousingType.SEPARATE_ROOM, rooms: 3, district: 'almaty-bostandyk', metro: 'Байконур' },
    { name: 'Жанель', age: 23, gender: Gender.FEMALE, occ: Occupation.WORKING, kind: ListingKind.SEEK_ROOMMATE, title: 'Ищу спокойную соседку, делим аренду пополам', price: 80000, type: HousingType.SHARED_ROOM, rooms: 2, district: 'almaty-medeu', metro: null },
    { name: 'Бекзат', age: 31, gender: Gender.MALE, occ: Occupation.WORKING, kind: ListingKind.OFFER_ROOM, title: 'Уютная комната в районе Орбита-3', price: 70000, type: HousingType.SEPARATE_ROOM, rooms: 2, district: 'almaty-auezov', metro: 'Алатау' },
    { name: 'Алишер', age: 19, gender: Gender.MALE, occ: Occupation.STUDENT, kind: ListingKind.SEEK_ROOMMATE, title: 'Двое студентов ищут третьего в 3-комн.', price: 60000, type: HousingType.BED_SPACE, rooms: 3, district: 'almaty-almaly', metro: 'Жибек Жолы' }
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

    const district = await prisma.district.findUnique({ where: { slug: d.district } });
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

  // Демо-переписка: диалог по объявлению и обращение в поддержку,
  // чтобы раздел «Сообщения» не открывался пустым на свежей базе
  const [seeker, host] = await Promise.all([
    prisma.user.findUnique({ where: { phone: '+77000000002' } }),
    prisma.user.findFirst({ where: { name: 'Айгерим' } })
  ]);

  if (seeker && host) {
    const hostListing = await prisma.listing.findFirst({ where: { authorId: host.id } });

    if (hostListing) {
      const existing = await prisma.thread.findFirst({
        where: { kind: 'LISTING', listingId: hostListing.id, userAId: seeker.id }
      });

      if (!existing) {
        const thread = await prisma.thread.create({
          data: { kind: 'LISTING', listingId: hostListing.id, userAId: seeker.id, userBId: host.id }
        });
        await prisma.message.createMany({
          data: [
            {
              threadId: thread.id,
              senderId: seeker.id,
              body: 'Здравствуйте! Комната ещё свободна? Могу посмотреть в субботу днём.',
              createdAt: new Date(Date.now() - 3 * 3600_000),
              readAt: new Date(Date.now() - 2.5 * 3600_000)
            },
            {
              threadId: thread.id,
              senderId: host.id,
              body: 'Добрый день, да, свободна. В субботу после 12 удобно. Коммуналка делится на троих.',
              createdAt: new Date(Date.now() - 2 * 3600_000)
            }
          ]
        });
        await prisma.thread.update({
          where: { id: thread.id },
          data: { lastMessageAt: new Date(Date.now() - 2 * 3600_000) }
        });
      }
    }

    const ticketExists = await prisma.thread.findFirst({ where: { kind: 'SUPPORT', userAId: seeker.id } });
    if (!ticketExists) {
      const ticket = await prisma.thread.create({
        data: {
          kind: 'SUPPORT',
          userAId: seeker.id,
          subject: 'Не открылись контакты после списания',
          status: 'OPEN'
        }
      });
      await prisma.message.create({
        data: {
          threadId: ticket.id,
          senderId: seeker.id,
          body: 'Списали 300 ₸ за открытие контактов, но номер не показался. Объявление №4.',
          createdAt: new Date(Date.now() - 26 * 3600_000)
        }
      });
      await prisma.thread.update({
        where: { id: ticket.id },
        data: { lastMessageAt: new Date(Date.now() - 26 * 3600_000) }
      });
    }
  }

  const districtCount = await prisma.district.count();
  console.log(`Готово. Городов: ${KZ_CITIES.length}, районов: ${districtCount}`);
  console.log('Админ: +77000000001 / admin12345 · Пользователь: +77000000002 / demo12345');
  console.log(`Создан пользователь ${admin.name}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
