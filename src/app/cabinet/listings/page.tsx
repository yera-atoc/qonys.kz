import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { EmptyState } from '@/components/EmptyState';
import { ListingRowActions } from '@/components/ListingRowActions';
import { tenge, STATUS_LABEL, timeAgo } from '@/lib/format';

export const metadata = { title: 'Мои объявления' };
export const dynamic = 'force-dynamic';

export default async function MyListingsPage() {
  const me = await requireUser();
  const listings = await prisma.listing.findMany({
    where: { authorId: me.id },
    orderBy: { createdAt: 'desc' },
    include: { promotions: { where: { isActive: true, endsAt: { gt: new Date() } } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Мои объявления</h1>
        <Link href="/post" className="btn-primary">
          Разместить ещё
        </Link>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="Объявлений пока нет"
          hint="Первые два размещения бесплатны — расскажите, кого вы ищете."
          actionHref="/post"
          actionLabel="Создать объявление"
        />
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="card-q p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2">
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
                    {l.promotions.map((p) => (
                      <span key={p.id} className="chip border-accent bg-accent-soft text-ink">
                        {p.type === 'TOP' ? 'ТОП' : p.type === 'URGENT' ? 'Срочно' : 'Выделено'} до{' '}
                        {p.endsAt.toLocaleDateString('ru-RU')}
                      </span>
                    ))}
                  </div>
                  <Link href={`/listing/${l.id}`} className="font-display font-semibold hover:text-brand">
                    {l.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {tenge(l.price)} · №{l.publicId} · {l.views} просмотров · {l.contactViews} открытий контактов
                  </p>
                  {l.status === 'REJECTED' && l.rejectReason && (
                    <p className="mt-2 rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">
                      Причина отклонения: {l.rejectReason}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted">Обновлено {timeAgo(l.updatedAt)}</p>
                </div>

                <ListingRowActions id={l.id} status={l.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
