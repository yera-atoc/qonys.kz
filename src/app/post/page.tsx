import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ListingForm } from '@/components/ListingForm';

export const metadata = { title: 'Разместить объявление' };
export const dynamic = 'force-dynamic';

export default async function PostPage() {
  const me = await currentUser();
  if (!me) redirect('/login?callbackUrl=/post');

  const [districts, activeCount, subscription, freeLimit] = await Promise.all([
    prisma.district.findMany({ where: { city: 'almaty' }, orderBy: { name: 'asc' } }),
    prisma.listing.count({ where: { authorId: me.id, status: { in: ['ACTIVE', 'MODERATION'] } } }),
    prisma.subscription.findFirst({
      where: { userId: me.id, status: 'ACTIVE', endsAt: { gt: new Date() } },
      include: { plan: true }
    }),
    prisma.setting.findUnique({ where: { key: 'free_listings_per_user' } })
  ]);

  const limit = subscription?.plan.listingLimit ?? Number(freeLimit?.value ?? 2);
  const overLimit = activeCount >= limit;

  return (
    <>
      <Header />
      <main className="container-q max-w-3xl py-12">
        <p className="eyebrow">Новое объявление</p>
        <h1 className="mt-3 font-display text-3xl font-bold">Расскажите, кого вы ищете</h1>
        <p className="mt-2 text-sm text-muted">
          Активных объявлений: {activeCount} из {limit}
          {subscription ? ` · тариф «${subscription.plan.title}»` : ' · бесплатный лимит'}
        </p>

        {overLimit ? (
          <div className="card-q mt-8 p-6">
            <h2 className="font-display text-lg font-semibold">Лимит объявлений исчерпан</h2>
            <p className="mt-2 text-sm text-muted">
              Архивируйте одно из старых объявлений в кабинете или подключите тариф — он снимает лимит и добавляет
              бесплатные поднятия.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="/cabinet/listings" className="btn-ghost">
                Мои объявления
              </a>
              <a href="/pricing" className="btn-primary">
                Посмотреть тарифы
              </a>
            </div>
          </div>
        ) : (
          <div className="card-q mt-8 p-6">
            <ListingForm districts={districts} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
