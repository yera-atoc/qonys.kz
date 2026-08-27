import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { StatTile } from '@/components/StatTile';
import { tenge } from '@/lib/format';

export const metadata = { title: 'Платежи' };
export const dynamic = 'force-dynamic';

const STATUS: Record<string, string> = {
  PENDING: 'Ожидает',
  PAID: 'Оплачен',
  FAILED: 'Ошибка',
  REFUNDED: 'Возврат'
};

export default async function AdminPaymentsPage() {
  await requireStaff();

  const [payments, paid, pending, promoRevenue, planRevenue] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 150,
      include: { user: { select: { name: true, phone: true } } }
    }),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.promotion.aggregate({ _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { comment: { startsWith: 'Тариф' } }, _sum: { amount: true } })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Платежи</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile value={tenge(paid._sum.amount ?? 0)} label="Принято платежей" tone="brand" />
        <StatTile value={tenge(promoRevenue._sum.amount ?? 0)} label="Продвижение объявлений" />
        <StatTile value={tenge(Math.abs(planRevenue._sum.amount ?? 0))} label="Тарифы риелторов" />
        <StatTile value={pending} label="Незавершённых платежей" tone="accent" />
      </div>

      <div className="card-q overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="p-4">Плательщик</th>
              <th className="p-4">Сумма</th>
              <th className="p-4">Провайдер</th>
              <th className="p-4">Назначение</th>
              <th className="p-4">Статус</th>
              <th className="p-4">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="p-4">
                  <p className="font-medium">{p.user.name}</p>
                  <p className="text-xs text-muted">{p.user.phone}</p>
                </td>
                <td className="p-4 font-semibold tabular-nums">{tenge(p.amount)}</td>
                <td className="p-4 text-xs text-muted">{p.provider}</td>
                <td className="p-4 text-xs text-muted">{p.purpose}</td>
                <td className="p-4">
                  <span
                    className={`chip ${
                      p.status === 'PAID'
                        ? 'border-brand/30 bg-brand-soft text-brand-ink'
                        : p.status === 'FAILED'
                        ? 'border-danger/30 bg-danger-soft text-danger'
                        : ''
                    }`}
                  >
                    {STATUS[p.status]}
                  </span>
                </td>
                <td className="p-4 text-xs text-muted">{p.createdAt.toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p className="p-8 text-center text-sm text-muted">Платежей ещё не было.</p>}
      </div>
    </div>
  );
}
