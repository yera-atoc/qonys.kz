import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { ModerationActions } from '@/components/admin/ModerationActions';
import { tenge, timeAgo, KIND_LABEL, HOUSING_LABEL } from '@/lib/format';

export const metadata = { title: 'Модерация' };
export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  await requireStaff();

  const queue = await prisma.listing.findMany({
    where: { status: 'MODERATION' },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, name: true, phone: true, createdAt: true } },
      district: { select: { name: true } }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Модерация</h1>
        <p className="mt-1 text-sm text-muted">
          {queue.length === 0 ? 'Очередь пуста — всё проверено.' : `В очереди ${queue.length}. Сначала самые старые.`}
        </p>
      </div>

      <div className="space-y-4">
        {queue.map((l) => (
          <article key={l.id} className="card-q p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="chip">{KIND_LABEL[l.kind]}</span>
                  <span className="chip">{HOUSING_LABEL[l.housingType]}</span>
                  <span className="chip">№{l.publicId}</span>
                </div>
                <Link href={`/listing/${l.id}`} className="font-display text-lg font-semibold hover:text-brand">
                  {l.title}
                </Link>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{l.description}</p>
                <p className="mt-3 text-sm">
                  <b>{tenge(l.price)}</b> · {l.district?.name ?? 'район не указан'} · {l.rooms}-комн.
                </p>
                <p className="mt-2 text-xs text-muted">
                  Автор: {l.author.name} ({l.author.phone}), на площадке с{' '}
                  {l.author.createdAt.toLocaleDateString('ru-RU')} · подано {timeAgo(l.createdAt)}
                </p>
              </div>

              <ModerationActions id={l.id} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
