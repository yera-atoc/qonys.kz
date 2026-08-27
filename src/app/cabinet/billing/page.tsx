import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { TopUpForm } from '@/components/TopUpForm';
import { tenge } from '@/lib/format';

export const metadata = { title: 'Баланс и платежи' };
export const dynamic = 'force-dynamic';

const TX_LABEL: Record<string, string> = {
  TOPUP: 'Пополнение',
  PURCHASE: 'Списание',
  REFUND: 'Возврат',
  BONUS: 'Бонус',
  ADMIN_ADJUST: 'Корректировка'
};

export default async function BillingPage() {
  const me = await requireUser();

  const wallet = await prisma.wallet.upsert({
    where: { userId: me.id },
    update: {},
    create: { userId: me.id },
    include: { transactions: { orderBy: { createdAt: 'desc' }, take: 40 } }
  });

  const payments = await prisma.payment.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Баланс и платежи</h1>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="card-q p-6">
          <p className="text-sm text-muted">Доступно на балансе</p>
          <p className="mt-1 font-display text-4xl font-bold">{tenge(wallet.balance + wallet.bonusBalance)}</p>
          <p className="mt-1 text-xs text-muted">
            Основной {tenge(wallet.balance)} · бонусный {tenge(wallet.bonusBalance)}. Бонусы тратятся первыми и не
            возвращаются.
          </p>
        </div>

        <div className="card-q p-6">
          <h2 className="font-display font-semibold">Пополнить</h2>
          <TopUpForm />
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">История операций</h2>
        {wallet.transactions.length === 0 ? (
          <p className="card-q p-6 text-sm text-muted">Операций пока не было.</p>
        ) : (
          <div className="card-q divide-y divide-line">
            {wallet.transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t.comment ?? TX_LABEL[t.type]}</p>
                  <p className="text-xs text-muted">
                    {t.createdAt.toLocaleString('ru-RU')} · {TX_LABEL[t.type]}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold tabular-nums ${t.amount > 0 ? 'text-brand' : 'text-ink'}`}>
                    {t.amount > 0 ? '+' : ''}
                    {tenge(t.amount)}
                  </p>
                  <p className="text-xs text-muted">остаток {tenge(t.balanceAfter)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {payments.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Платежи</h2>
          <div className="card-q divide-y divide-line">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-medium">{tenge(p.amount)}</p>
                  <p className="text-xs text-muted">
                    {p.provider} · {p.createdAt.toLocaleString('ru-RU')}
                  </p>
                </div>
                <span
                  className={`chip ${
                    p.status === 'PAID'
                      ? 'border-brand/30 bg-brand-soft text-brand-ink'
                      : p.status === 'FAILED'
                      ? 'border-danger/30 bg-danger-soft text-danger'
                      : ''
                  }`}
                >
                  {p.status === 'PAID' ? 'Оплачен' : p.status === 'PENDING' ? 'Ожидает оплаты' : 'Ошибка'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
