import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactPanel } from '@/components/ContactPanel';
import { ReportButton } from '@/components/ReportButton';
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

  return (
    <>
      <Header />
      <main className="container-q py-10">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← Вернуться в ленту
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <article>
            <div className="flex flex-wrap gap-2">
              <span className="chip border-brand/30 bg-brand-soft text-brand-ink">{KIND_LABEL[listing.kind]}</span>
              {listing.promotions.some((p) => p.type === 'URGENT') && (
                <span className="chip border-danger/30 bg-danger-soft text-danger">Срочно</span>
              )}
              <span className="chip">№{listing.publicId}</span>
            </div>

            <h1 className="mt-4 font-display text-3xl font-bold leading-tight">{listing.title}</h1>

            <div className="price-rail mt-6">
              <p className="font-display text-3xl font-bold">{tenge(listing.price)}</p>
              <p className="text-sm text-muted">
                в месяц{listing.deposit > 0 ? ` · залог ${tenge(listing.deposit)}` : ''}
              </p>
            </div>

            {listing.photos.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.photos.map((p) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={p.id} src={p.url} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
                ))}
              </div>
            )}

            <div className="card-q mt-8 grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              <Fact label="Район" value={listing.district?.name ?? '—'} />
              <Fact label="Метро" value={listing.metro ?? '—'} />
              <Fact label="Тип" value={HOUSING_LABEL[listing.housingType]} />
              <Fact label="Комнат" value={String(listing.rooms)} />
            </div>

            <section className="mt-8">
              <h2 className="font-display text-lg font-semibold">Описание</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/90">{listing.description}</p>
            </section>

            {listing.habits.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-lg font-semibold">Привычки и правила</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.habits.map((h) => (
                    <span key={h} className="chip">{h}</span>
                  ))}
                </div>
              </section>
            )}

            {listing.amenities.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-lg font-semibold">В квартире есть</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span key={a} className="chip">{a}</span>
                  ))}
                </div>
              </section>
            )}

            <p className="mt-10 text-xs text-muted">
              Опубликовано {timeAgo(listing.publishedAt ?? listing.createdAt)} · {listing.views} просмотров
            </p>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card-q p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft font-semibold text-brand-ink">
                  {listing.author.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold">
                    {listing.author.name}
                    {age ? `, ${age}` : ''}
                  </p>
                  <p className="text-xs text-muted">
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

            <div className="card-q p-5 text-sm text-muted">
              <h3 className="mb-2 font-semibold text-ink">Не переводите предоплату</h3>
              <p>
                Осмотрите комнату лично, познакомьтесь с соседями и только потом обсуждайте деньги. Qonys не участвует в
                расчётах.{' '}
                <Link href="/safety" className="text-brand hover:underline">
                  Как проверить объявление
                </Link>
              </p>
              <div className="mt-4 border-t border-line pt-4">
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
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
