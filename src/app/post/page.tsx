import { redirect } from 'next/navigation';
import Link from 'next/link';
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

  const myProfile = await prisma.user.findUnique({ where: { id: me.id }, select: { city: true } });
  const initialCity = myProfile?.city ?? 'almaty';

  const [districts, activeCount, subscription, freeLimit] = await Promise.all([
    prisma.district.findMany({ where: { city: initialCity }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
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
      <main className="container-q max-w-3xl py-14">
        <span className="pill pill-dot">Новое объявление</span>

        <h1 className="mt-6 font-display text-[36px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[44px]">
          Расскажите, кого вы ищете
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          Активных объявлений: {activeCount} из {limit}
          {subscription ? ` · тариф «${subscription.plan.title}»` : ' · бесплатный лимит'}
        </p>

        {overLimit ? (
          <div className="mt-10 rounded-2xl border border-line bg-subtle p-8">
            <h2 className="font-display text-[22px] font-bold tracking-tight">Лимит объявлений исчерпан</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Архивируйте одно из старых объявлений в кабинете или подключите тариф — он снимает лимит и добавляет
              бесплатные поднятия.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/pricing" className="btn-primary">Посмотреть тарифы</Link>
              <Link href="/cabinet/listings" className="btn-ghost">Мои объявления</Link>
            </div>
          </div>
        ) : (
          <div className="mt-10">
            <ListingForm districts={districts} initialCity={initialCity} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
