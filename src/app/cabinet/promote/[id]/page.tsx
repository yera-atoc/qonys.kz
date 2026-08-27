import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { PromoPicker } from '@/components/PromoPicker';
import { tenge } from '@/lib/format';

export const metadata = { title: 'Продвижение объявления' };
export const dynamic = 'force-dynamic';

export default async function PromotePage({ params }: { params: { id: string } }) {
  const me = await requireUser();
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { promotions: { where: { isActive: true, endsAt: { gt: new Date() } } } }
  });
  if (!listing || listing.authorId !== me.id) notFound();

  const [packages, wallet] = await Promise.all([
    prisma.promoPackage.findMany({ where: { isActive: true }, orderBy: { sort: 'asc' } }),
    prisma.wallet.findUnique({ where: { userId: me.id } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Продвижение</h1>
        <p className="mt-1 text-sm text-muted">{listing.title}</p>
      </div>

      {listing.promotions.length > 0 && (
        <div className="card-q p-4 text-sm">
          <p className="font-medium">Уже активно</p>
          <ul className="mt-2 space-y-1 text-muted">
            {listing.promotions.map((p) => (
              <li key={p.id}>
                {p.type} — до {p.endsAt.toLocaleDateString('ru-RU')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm text-muted">
        На балансе {tenge((wallet?.balance ?? 0) + (wallet?.bonusBalance ?? 0))}
      </p>

      <PromoPicker listingId={listing.id} packages={packages.map((p) => ({ ...p }))} />
    </div>
  );
}
