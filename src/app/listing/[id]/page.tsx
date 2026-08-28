import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactPanel } from '@/components/ContactPanel';
import { ReportButton } from '@/components/ReportButton';
import { Gallery } from '@/components/Gallery';
import { tenge, timeAgo, KIND_LABEL, HOUSING_LABEL, OCCUPATION_LABEL } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      district: true,
      photos: { orderBy: { sort: 'asc' } },
      author: true,
      promotions: { where: { isActive: true, endsAt: { gt: new Date() } } }
    }
  });

  if (!listing || listing.status !== 'ACTIVE') notFound();

  await prisma.listing.update({ where: { id: listing.id }, data: { views: { increment: 1 } } });

  const me = await currentUser();
  const unlocked = me
    ? me.id === listing.authorId ||
      Boolean(
        await prisma.contactUnlock.findUnique({
          where: { userId_listingId: { userId: me.id, listingId: listing.id } }
        })
      )
    : false;

  const priceSetting = await prisma.setting.findUnique({ where: { key: 'contact_unlock_price' } });
  const age = listing.author.birthYear ? new Date().getFullYear() - listing.author.birthYear : null;
  const location = [listing.district?.name, listing.metro ? `м. ${listing.metro}` : null].filter(Boolean).join(' · ');

  return (
    <>
      <Header />
      <main className="container-q py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[15px] text-muted transition hover:text-ink">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 3 5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Вернуться в ленту
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
          <article className="min-w-0">
            <Gallery photos={listing.photos.map((p) => p.url)} />

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="pill pill-dot">{KIND_LABEL[listing.kind]}</span>
              {listing.promotions.some((p) => p.type === 'URGENT') && (
                <span className="pill border-danger/20 bg-danger text-white">Срочно</span>
              )}
              <span className="pill">№{listing.publicId}</span>
            </div>

            <h1 className="mt-5 font-display text-[32px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[40px]">
              {listing.title}
            </h1>

            <p className="mt-4 text-[16px] text-muted">{location || 'Алматы'}</p>

            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
              <Fact label="Цена" value={tenge(listing.price)} />
              <Fact label="Залог" value={listing.deposit > 0 ? tenge(listing.deposit) : 'нет'} />
              <Fact label="Тип" value={HOUSING_LABEL[listing.housingType]} />
              <Fact label="Комнат" value={String(listing.rooms)} />
            </div>

            <section className="mt-10">
              <h2 className="font-display text-[22px] font-bold tracking-tight">Описание</h2>
              <p className="mt-4 whitespace-pre-line text-[16px] leading-relaxed">{listing.description}</p>
            </section>

            {listing.habits.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-[22px] font-bold tracking-tight">Привычки и правила</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {listing.habits.map((h) => (
                    <span key={h} className="rounded-full bg-subtle px-4 py-2 text-[14px] text-ink">{h}</span>
                  ))}
                </div>
              </section>
            )}

            {listing.amenities.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-[22px] font-bold tracking-tight">В квартире есть</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span key={a} className="rounded-full bg-subtle px-4 py-2 text-[14px] text-ink">{a}</span>
                  ))}
                </div>
              </section>
            )}

            <p className="mt-12 text-[13px] text-muted">
              Опубликовано {timeAgo(listing.publishedAt ?? listing.createdAt)} · {listing.views} просмотров
            </p>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card-q p-6">
              <p className="font-display text-[30px] font-extrabold leading-none tracking-tight">
                {tenge(listing.price)}
              </p>
              <p className="mt-1.5 text-[14px] text-muted">в месяц</p>

              <div className="mt-6 flex items-center gap-3 border-t border-line pt-6">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-subtle text-[14px] font-semibold text-muted">
                  {listing.author.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-[15px] font-medium">
                    {listing.author.name}
                    {age ? `, ${age}` : ''}
                  </p>
                  <p className="text-[13px] text-muted">
                    {listing.author.occupation ? OCCUPATION_LABEL[listing.author.occupation] : 'Профиль'}
                    {listing.author.phoneVerified ? ' · телефон подтверждён' : ''}
                  </p>
                </div>
              </div>

              <ContactPanel
                listingId={listing.id}
                unlocked={unlocked}
                phone={unlocked ? listing.author.phone : null}
                price={Number(priceSetting?.value ?? 300)}
                signedIn={Boolean(me)}
              />
            </div>

            <div className="rounded-2xl bg-subtle p-6">
              <h3 className="text-[15px] font-semibold">Не переводите предоплату</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                Осмотрите комнату лично, познакомьтесь с соседями и только потом обсуждайте деньги. Qonys не участвует в
                расчётах.{' '}
                <Link href="/safety" className="text-ink underline underline-offset-2">
                  Как проверить объявление
                </Link>
              </p>
              <div className="mt-5 border-t border-line pt-5">
                <ReportButton listingId={listing.id} />
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1.5 font-display text-[17px] font-bold tracking-tight">{value}</p>
    </div>
  );
}
