import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { StatTile } from '@/components/StatTile';
import { EmptyState } from '@/components/EmptyState';
import { tenge, STATUS_LABEL, timeAgo } from '@/lib/format';

export const metadata = { title: 'Кабинет' };
export const dynamic = 'force-dynamic';

export default async function CabinetPage() {
  const me = await requireUser();

  const [listings, views, contacts, spent, subscription] = await Promise.all([
    prisma.listing.findMany({
      where: { authorId: me.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { promotions: { where: { isActive: true, endsAt: { gt: new Date() } } } }
    }),
    prisma.listing.aggregate({ where: { authorId: me.id }, _sum: { views: true } }),
    prisma.listing.aggregate({ where: { authorId: me.id }, _sum: { contactViews: true } }),
    prisma.transaction.aggregate({
      where: { wallet: { userId: me.id }, type: 'PURCHASE' },
      _sum: { amount: true }
    }),
    prisma.subscription.findFirst({
      where: { userId: me.id, status: 'ACTIVE', endsAt: { gt: new Date() } },
      include: { plan: true }
    })
  ]);

  const activeCount = listings.filter((l) => l.status === 'ACTIVE').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Обзор</h1>
        <p className="mt-1 text-sm text-muted">
          {subscription ? `Тариф «${subscription.plan.title}» до ${subscription.endsAt.toLocaleDateString('ru-RU')}` : 'Бесплатный аккаунт'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile value={activeCount} label="Активных объявлений" tone="brand" />
        <StatTile value={views._sum.views ?? 0} label="Просмотров всего" />
        <StatTile value={contacts._sum.contactViews ?? 0} label="Открытий контактов" hint="сколько раз открыли ваш номер" />
        <StatTile value={tenge(Math.abs(spent._sum.amount ?? 0))} label="Потрачено на продвижение" tone="accent" />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Последние объявления</h2>
          <Link href="/cabinet/listings" className="text-sm text-brand hover:underline">
            Все объявления
          </Link>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            title="Пока пусто"
            hint="Разместите первое объявление — это бесплатно и занимает пару минут."
            actionHref="/post"
            actionLabel="Разместить объявление"
          />
        ) : (
          <div className="space-y-3">
            {listings.map((l) => (
              <div key={l.id} className="card-q flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <Link href={`/listing/${l.id}`} className="font-medium hover:text-brand">
                    {l.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {tenge(l.price)} · {l.views} просмотров · обновлено {timeAgo(l.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {l.promotions.map((p) => (
                    <span key={p.id} className="chip border-accent bg-accent-soft text-ink">
                      {p.type === 'TOP' ? 'ТОП' : p.type === 'URGENT' ? 'Срочно' : 'Продвижение'}
                    </span>
                  ))}
                  <span
                    className={`chip ${
                      l.status === 'ACTIVE'
                        ? 'border-brand/30 bg-brand-soft text-brand-ink'
                        : l.status === 'REJECTED'
                        ? 'border-danger/30 bg-danger-soft text-danger'
                        : ''
                    }`}
                  >
                    {STATUS_LABEL[l.status]}
                  </span>
                  <Link href={`/cabinet/promote/${l.id}`} className="btn-ghost text-xs">
                    Продвинуть
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
