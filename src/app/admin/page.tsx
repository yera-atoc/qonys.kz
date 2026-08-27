import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { StatTile } from '@/components/StatTile';
import { tenge, timeAgo } from '@/lib/format';

export const metadata = { title: 'Дашборд' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const monthAgo = new Date(Date.now() - 30 * 864e5);

  const [users, activeListings, moderation, revenueMonth, revenueAll, recentPayments, topPromos] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.listing.count({ where: { status: 'MODERATION' } }),
    prisma.payment.aggregate({ where: { status: 'PAID', paidAt: { gte: monthAgo } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.payment.findMany({
      where: { status: 'PAID' },
      orderBy: { paidAt: 'desc' },
      take: 8,
      include: { user: { select: { name: true, phone: true } } }
    }),
    prisma.promotion.groupBy({ by: ['type'], _sum: { amount: true }, _count: true })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Дашборд</h1>
        <p className="mt-1 text-sm text-muted">Сводка по площадке за последние 30 дней</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile value={tenge(revenueMonth._sum.amount ?? 0)} label="Выручка за месяц" tone="brand" />
        <StatTile value={tenge(revenueAll._sum.amount ?? 0)} label="Выручка всего" />
        <StatTile value={activeListings} label="Активных объявлений" />
        <StatTile value={users} label="Пользователей" />
      </div>

      {moderation > 0 && (
        <Link
          href="/admin/moderation"
          className="flex items-center justify-between rounded-2xl border border-accent bg-accent-soft p-5 transition hover:shadow-card"
        >
          <div>
            <p className="font-display font-semibold">{moderation} объявлений ждут проверки</p>
            <p className="text-sm text-muted">Норматив ответа — 24 часа с момента подачи</p>
          </div>
          <span className="btn-accent">Открыть модерацию</span>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Продажи по услугам</h2>
          <div className="card-q divide-y divide-line">
            {topPromos.length === 0 && <p className="p-5 text-sm text-muted">Продвижений пока не покупали.</p>}
            {topPromos.map((p) => (
              <div key={p.type} className="flex items-center justify-between p-4 text-sm">
                <span>{p.type}</span>
                <span className="text-muted">
                  {p._count} шт · <b className="text-ink">{tenge(p._sum.amount ?? 0)}</b>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Последние платежи</h2>
          <div className="card-q divide-y divide-line">
            {recentPayments.length === 0 && <p className="p-5 text-sm text-muted">Платежей ещё не было.</p>}
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-medium">{p.user.name}</p>
                  <p className="text-xs text-muted">
                    {p.user.phone} · {p.paidAt ? timeAgo(p.paidAt) : '—'}
                  </p>
                </div>
                <span className="font-semibold">{tenge(p.amount)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
