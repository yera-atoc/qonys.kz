import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { PriceEditor } from '@/components/admin/PriceEditor';

export const metadata = { title: 'Тарифы и пакеты' };
export const dynamic = 'force-dynamic';

export default async function TariffsPage() {
  await requireStaff();
  const [plans, packages] = await Promise.all([
    prisma.plan.findMany({ orderBy: { sort: 'asc' } }),
    prisma.promoPackage.findMany({ orderBy: { sort: 'asc' } })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Тарифы и пакеты</h1>
        <p className="mt-1 text-sm text-muted">Цены меняются здесь — на витрине они обновятся сразу.</p>
      </div>

      <PriceEditor
        plans={plans.map((p) => ({ id: p.id, title: p.title, price: p.price, listingLimit: p.listingLimit, isActive: p.isActive }))}
        packages={packages.map((p) => ({ id: p.id, title: p.title, price: p.price, days: p.days, type: p.type, isActive: p.isActive }))}
      />
    </div>
  );
}
