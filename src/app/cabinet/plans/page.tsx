import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { PlanPicker } from '@/components/PlanPicker';
import { tenge } from '@/lib/format';

export const metadata = { title: 'Тариф' };
export const dynamic = 'force-dynamic';

export default async function PlansPage() {
  const me = await requireUser();
  const [plans, current, wallet] = await Promise.all([
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { sort: 'asc' } }),
    prisma.subscription.findFirst({
      where: { userId: me.id, status: 'ACTIVE', endsAt: { gt: new Date() } },
      include: { plan: true }
    }),
    prisma.wallet.findUnique({ where: { userId: me.id } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Тариф</h1>
        <p className="mt-1 text-sm text-muted">
          {current
            ? `Активен «${current.plan.title}» до ${current.endsAt.toLocaleDateString('ru-RU')}`
            : 'Сейчас у вас бесплатный аккаунт: два активных объявления.'}
        </p>
      </div>

      <p className="text-sm text-muted">
        На балансе {tenge((wallet?.balance ?? 0) + (wallet?.bonusBalance ?? 0))}
      </p>

      <PlanPicker
        currentPlanId={current?.planId ?? null}
        plans={plans.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          price: p.price,
          listingLimit: p.listingLimit,
          freeBumps: p.freeBumps,
          freeTopDays: p.freeTopDays,
          hasAnalytics: p.hasAnalytics,
          hasBadge: p.hasBadge
        }))}
      />
    </div>
  );
}
