import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Filters } from '@/components/Filters';
import { ListingCard } from '@/components/ListingCard';
import { EmptyState } from '@/components/EmptyState';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | undefined>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const where: Prisma.ListingWhereInput = { status: 'ACTIVE', city: 'almaty' };

  if (searchParams.kind) where.kind = searchParams.kind as any;
  if (searchParams.district) where.districtId = searchParams.district;
  if (searchParams.housingType) where.housingType = searchParams.housingType as any;
  if (searchParams.gender) where.preferGender = searchParams.gender as any;
  if (searchParams.maxPrice) where.price = { lte: Number(searchParams.maxPrice) };

  const [districts, listings, total] = await Promise.all([
    prisma.district.findMany({
      where: { city: 'almaty' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    }),
    prisma.listing.findMany({
      where,
      orderBy: [{ rank: 'desc' }, { bumpedAt: 'desc' }],
      take: 36,
      select: {
        id: true, kind: true, title: true, price: true, rooms: true, metro: true,
        housingType: true, bumpedAt: true,
        district: { select: { name: true } },
        author: { select: { name: true, birthYear: true, occupation: true } },
        photos: { select: { url: true }, orderBy: { sort: 'asc' }, take: 1 },
        promotions: { where: { isActive: true, endsAt: { gt: new Date() } }, select: { type: true } }
      }
    }),
    prisma.listing.count({ where: { status: 'ACTIVE' } })
  ]);

  const cards = listings.map((l) => ({
    id: l.id,
    kind: l.kind,
    title: l.title,
    price: l.price,
    rooms: l.rooms,
    metro: l.metro,
    housingType: l.housingType,
    bumpedAt: l.bumpedAt,
    district: l.district,
    author: l.author,
    photoUrl: l.photos[0]?.url ?? null,
    promoTypes: l.promotions.map((p) => p.type)
  }));

  return (
    <>
      <Header />

      <main>
        {/* Герой с мятным градиентом */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#EDF6EF] via-[#F6FAF7] to-white">
          <div className="container-q relative py-16 sm:py-24">
            <span className="pill pill-dot animate-rise">Бета в Алматы · скоро Астана и Шымкент</span>

            <h1 className="mt-8 max-w-4xl font-display text-[42px] font-extrabold leading-[1.04] tracking-[-0.03em] sm:text-[64px] lg:text-[76px]">
              Подселение, которое находит соседа за один день.
            </h1>

            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-[19px]">
              Qonys соединяет тех, кто ищет комнату, и тех, кто ищет соседа. Прозрачные анкеты, фильтры по привычкам и
              району — без бесконечного скролла по чатам.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/post" className="btn-primary">Разместить объявление</Link>
              <Link href="#feed" className="btn-ghost">Смотреть ленту</Link>
            </div>

            <dl className="mt-16 flex flex-wrap gap-x-16 gap-y-8">
              <Stat value={`${total.toLocaleString('ru-RU')}+`} label="анкет в Алматы" />
              <Stat value="8" label="районов" />
              <Stat value="24 ч" label="до первого ответа" />
            </dl>
          </div>
        </section>

        {/* Лента */}
        <section id="feed" className="container-q scroll-mt-24 py-14">
          <h2 className="font-display text-[32px] font-extrabold tracking-tight">Лента</h2>
          <p className="mt-2 text-[15px] text-muted">
            Найдено {cards.length} {plural(cards.length, 'объявление', 'объявления', 'объявлений')} по вашим критериям
          </p>

          <div className="mt-8">
            <Suspense fallback={<div className="h-32" />}>
              <Filters districts={districts} />
            </Suspense>
          </div>

          <div className="mt-10">
            {cards.length === 0 ? (
              <EmptyState
                title="Под эти фильтры пока ничего нет"
                hint="Расширьте бюджет или уберите район — в Алматы каждый день появляются новые анкеты."
                actionHref="/"
                actionLabel="Сбросить фильтры"
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((item) => (
                  <ListingCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Как это работает */}
        <section className="border-t border-line bg-subtle">
          <div className="container-q py-16">
            <h2 className="font-display text-[32px] font-extrabold tracking-tight">Как это работает</h2>
            <ol className="mt-10 grid gap-10 sm:grid-cols-3">
              {[
                ['01', 'Заполни анкету', 'Расскажи, кого ищешь: район, бюджет, привычки. Чем точнее — тем меньше пустых переписок.'],
                ['02', 'Смотри подходящих', 'Лента подбирает анкеты под твои критерии. Видно профессию, расписание, привычки.'],
                ['03', 'Договаривайся в чате', 'Пиши напрямую, договаривайся о просмотре. Контакты скрыты до твоего согласия.']
              ].map(([n, title, text]) => (
                <li key={n}>
                  <span className="font-display text-[15px] font-bold text-muted">{n}</span>
                  <h3 className="mt-4 font-display text-[20px] font-bold tracking-tight">{title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-[34px] font-extrabold leading-none tracking-tight tabular-nums">{value}</dt>
      <dd className="mt-2 text-[15px] text-muted">{label}</dd>
    </div>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
