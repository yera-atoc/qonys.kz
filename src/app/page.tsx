import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Filters } from '@/components/Filters';
import { ListingCard, ListingCardSkeleton } from '@/components/ListingCard';
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

  // Один заход в базу вместо трёх последовательных
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
        id: true,
        kind: true,
        title: true,
        price: true,
        rooms: true,
        metro: true,
        housingType: true,
        bumpedAt: true,
        habits: true,
        district: { select: { name: true } },
        author: { select: { name: true, birthYear: true, occupation: true } },
        photos: { select: { url: true }, orderBy: { sort: 'asc' }, take: 1 },
        promotions: {
          where: { isActive: true, endsAt: { gt: new Date() } },
          select: { type: true }
        }
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
    habits: l.habits,
    district: l.district,
    author: l.author,
    photoUrl: l.photos[0]?.url ?? null,
    promoTypes: l.promotions.map((p) => p.type)
  }));

  return (
    <>
      <Header />

      <main>
        {/* Герой */}
        <section className="relative overflow-hidden border-b border-line bg-card">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full
                       bg-gradient-to-br from-brand-soft to-accent-soft blur-3xl opacity-70"
          />
          <div className="container-q relative py-14 sm:py-20">
            <p className="eyebrow">Бета в Алматы · скоро Астана и Шымкент</p>
            <h1 className="mt-4 max-w-3xl font-display text-[34px] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[56px]">
              Подселение, которое не превратится в кошмар.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-lg">
              Qonys соединяет тех, кто ищет комнату, и тех, кто ищет соседа. Прозрачные анкеты, фильтры по привычкам и
              району — без бесконечного скролла по чатам.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/post" className="btn-primary px-5 py-3">
                Разместить объявление
              </Link>
              <Link href="#feed" className="btn-ghost px-5 py-3">
                Смотреть ленту
              </Link>
            </div>

            <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-6 border-t border-line pt-8">
              <Stat value={`${total.toLocaleString('ru-RU')}+`} label="анкет в Алматы" />
              <Stat value="8" label="районов" />
              <Stat value="24 ч" label="до первого ответа" />
            </dl>
          </div>
        </section>

        {/* Лента */}
        <section id="feed" className="container-q scroll-mt-20 py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Лента</h2>
              <p className="mt-1 text-sm text-muted">
                {cards.length} {plural(cards.length, 'объявление', 'объявления', 'объявлений')}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <Suspense fallback={<div className="h-12" />}>
              <Filters districts={districts} />
            </Suspense>
          </div>

          {cards.length === 0 ? (
            <EmptyState
              title="Под эти фильтры пока ничего нет"
              hint="Расширьте бюджет или уберите район — в Алматы каждый день появляются новые анкеты."
              actionHref="/"
              actionLabel="Сбросить фильтры"
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((item) => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Как это работает */}
        <section className="border-t border-line bg-card">
          <div className="container-q py-16">
            <h2 className="font-display text-2xl font-bold">Как это работает</h2>
            <ol className="mt-8 grid gap-8 sm:grid-cols-3">
              {[
                ['01', 'Заполни анкету', 'Расскажи, кого ищешь: район, бюджет, привычки. Чем точнее — тем меньше пустых переписок.'],
                ['02', 'Смотри подходящих', 'Лента подбирает анкеты под твои критерии. Видно профессию, расписание, привычки.'],
                ['03', 'Договаривайся в чате', 'Пиши напрямую, договаривайся о просмотре. Контакты скрыты до твоего согласия.']
              ].map(([n, title, text]) => (
                <li key={n}>
                  <span className="font-display text-sm font-bold text-brand">{n}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
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
      <dt className="font-display text-[28px] font-bold leading-none tabular-nums">{value}</dt>
      <dd className="mt-1.5 text-sm text-muted">{label}</dd>
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
