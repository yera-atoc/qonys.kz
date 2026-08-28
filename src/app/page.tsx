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
    prisma.district.findMany({ where: { city: 'almaty' }, orderBy: { name: 'asc' } }),
    prisma.listing.findMany({
      where,
      orderBy: [{ rank: 'desc' }, { bumpedAt: 'desc' }],
      take: 40,
      include: {
        district: { select: { name: true } },
        author: { select: { name: true, birthYear: true, occupation: true } },
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
    promoTypes: l.promotions.map((p) => p.type)
  }));

  return (
    <>
      <Header />

      <main>
        {/* Герой */}
        <section className="border-b border-line bg-card">
          <div className="container-q py-16 sm:py-24">
            <p className="eyebrow animate-rise">Бета в Алматы · скоро Астана и Шымкент</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Подселение, которое не превратится в кошмар.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted sm:text-lg">
              Qonys соединяет тех, кто ищет комнату, и тех, кто ищет соседа. Прозрачные анкеты, фильтры по привычкам и
              району — без бесконечного скролла по чатам.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/post" className="btn-primary">
                Разместить объявление
              </Link>
              <Link href="#feed" className="btn-ghost">
                Смотреть ленту
              </Link>
            </div>

            <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-8 border-t border-line pt-8">
              <Stat value={`${total.toLocaleString('ru-RU')}+`} label="анкет в Алматы" />
              <Stat value="8" label="районов" />
              <Stat value="24 ч" label="до первого ответа" />
            </dl>
          </div>
        </section>

        {/* Лента */}
        <section id="feed" className="container-q scroll-mt-20 py-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Лента</h2>
              <p className="mt-1 text-sm text-muted">
                Найдено {cards.length} {plural(cards.length, 'объявление', 'объявления', 'объявлений')} по вашим критериям
              </p>
            </div>
          </div>

          <div className="card-q mb-8 p-5">
            <Suspense fallback={<div className="h-40" />}>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <p className="mt-2 text-sm text-muted">{text}</p>
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
      <dt className="font-display text-3xl font-bold tabular-nums">{value}</dt>
      <dd className="mt-1 text-sm text-muted">{label}</dd>
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
