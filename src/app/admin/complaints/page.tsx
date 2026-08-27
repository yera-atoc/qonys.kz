import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { ComplaintActions } from '@/components/admin/ComplaintActions';
import { timeAgo } from '@/lib/format';

export const metadata = { title: 'Жалобы' };
export const dynamic = 'force-dynamic';

export default async function ComplaintsPage() {
  await requireStaff();
  const complaints = await prisma.complaint.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 100,
    include: {
      listing: { select: { id: true, title: true, status: true } },
      author: { select: { name: true, phone: true } }
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Жалобы</h1>

      {complaints.length === 0 ? (
        <p className="card-q p-8 text-center text-sm text-muted">Жалоб нет. Хороший знак.</p>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="card-q flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="mb-2 flex gap-2">
                  <span className={`chip ${c.status === 'NEW' ? 'border-danger/30 bg-danger-soft text-danger' : ''}`}>
                    {c.status === 'NEW' ? 'Новая' : c.status === 'RESOLVED' ? 'Решена' : c.status === 'DECLINED' ? 'Отклонена' : 'В работе'}
                  </span>
                  <span className="chip">{c.reason}</span>
                </div>
                <Link href={`/listing/${c.listing.id}`} className="font-medium hover:text-brand">
                  {c.listing.title}
                </Link>
                {c.comment && <p className="mt-2 text-sm text-muted">{c.comment}</p>}
                <p className="mt-2 text-xs text-muted">
                  От {c.author?.name ?? 'анонима'} · {timeAgo(c.createdAt)}
                </p>
              </div>
              {c.status === 'NEW' && <ComplaintActions id={c.id} listingId={c.listing.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
