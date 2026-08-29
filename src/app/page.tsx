import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Filters } from '@/components/Filters';
import { FeedView } from '@/components/FeedView';
import { getKzCity, DEFAULT_CITY, KZ_CITIES, cityName } from '@/lib/kzCities';
import { getT } from '@/lib/i18n/server';
import { LOCALE_META } from '@/lib/i18n';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | undefined>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const { locale, t } = getT();
  const city = getKzCity(searchParams.city ?? '')?.slug ?? DEFAULT_CITY;

  const where: Prisma.ListingWhereInput = { status: 'ACTIVE', city };

  if (searchParams.kind) where.kind = searchParams.kind as any;
  if (searchParams.district) where.districtId = searchParams.district;
  if (searchParams.housingType) where.housingType = searchParams.housingType as any;
  if (searchParams.gender) where.preferGender = searchParams.gender as any;
  if (searchParams.maxPrice) where.price = { lte: Number(searchParams.maxPrice) };

  const [districts, listings, total] = await Promise.all([
    prisma.district.findMany({
      where: { city },
      orderBy: { sort: 'asc' },
      select: { id: true, name: true, nameKk: true, nameEn: true }
    }),
    prisma.listing.findMany({
      where,
      orderBy: [{ rank: 'desc' }, { bumpedAt: 'desc' }],
      take: 36,
      select: {
        id: true, kind: true, title: true, price: true, rooms: true, metro: true,
        housingType: true, bumpedAt: true, lat: true, lng: true,
        district: { select: { name: true, nameKk: true, nameEn: true } },
        author: { select: { name: true, birthYear: true, occupation: true } },
        photos: { select: { url: true }, orderBy: { sort: 'asc' }, take: 1 },
        promotions: { where: { isActive: true, endsAt: { gt: new Date() } }, select: { type: true } }
      }
    }),
    prisma.listing.count({ where: { status: 'ACTIVE', city } })
  ]);

  const totalDistricts = KZ_CITIES.reduce((sum, c) => sum + c.districts.length, 0);

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

  const mapListings = listings.map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    kind: l.kind,
    lat: l.lat,
    lng: l.lng
  }));

  return (
    <>
      <Header />

      <main>
        {/* Герой с мятным градиентом */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#EDF6EF] via-[#F6FAF7] to-white">
          <div className="container-q relative py-16 sm:py-24">
            {/* Города перечислены явно: обещаем ровно то, что открыто */}
            <span className="pill pill-dot animate-rise">
              {KZ_CITIES.map((c) => c[locale]).join(' · ')}
            </span>

            <h1 className="mt-8 max-w-4xl font-display text-[42px] font-extrabold leading-[1.04] tracking-[-0.03em] sm:text-[64px] lg:text-[76px]">
              {t.home.title}
            </h1>

            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-[19px]">
              {t.home.subtitle}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/post" className="btn-primary">{t.home.ctaPost}</Link>
              <Link href="#feed" className="btn-ghost">{t.home.ctaFeed}</Link>
            </div>

            <dl className="mt-16 flex flex-wrap gap-x-16 gap-y-8">
              <Stat
                value={total.toLocaleString(LOCALE_META[locale].intl)}
                label={`${t.home.statListings} · ${cityName(city, locale)}`}
              />
              <Stat value={String(totalDistricts || '—')} label={t.home.statDistricts} />
              <Stat value="24 ч" label={t.home.statReply} />
            </dl>
          </div>
        </section>

        {/* Лента */}
        <section id="feed" className="container-q scroll-mt-24 py-14">
          <h2 className="font-display text-[32px] font-extrabold tracking-tight">{t.feed.title}</h2>
          <p className="mt-2 text-[15px] text-muted">{t.feed.found(cards.length)}</p>

          <div className="mt-8">
            <Suspense fallback={<div className="h-32" />}>
              <Filters districts={districts} city={city} />
            </Suspense>
          </div>

          <div className="mt-10">
            <FeedView cards={cards} mapListings={mapListings} citySlug={city} />
          </div>
        </section>

        {/* Как это работает */}
        <section className="border-t border-line bg-subtle">
          <div className="container-q py-16">
            <h2 className="font-display text-[32px] font-extrabold tracking-tight">{t.home.howTitle}</h2>
            <ol className="mt-10 grid gap-10 sm:grid-cols-3">
              {[
                ['01', t.home.step1Title, t.home.step1Text],
                ['02', t.home.step2Title, t.home.step2Text],
                ['03', t.home.step3Title, t.home.step3Text]
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
