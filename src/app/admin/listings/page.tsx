import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { tenge, timeAgo, STATUS_LABEL } from '@/lib/format';
import type { Prisma } from '@prisma/client';

export const metadata = { title: 'Объявления' };
export const dynamic = 'force-dynamic';

const TABS = ['ALL', 'ACTIVE', 'MODERATION', 'REJECTED', 'ARCHIVED'] as const;

export default async function AdminListingsPage({
  searchParams
}: {
  searchParams: { status?: string; q?: string };
}) {
  await requireStaff();

  const where: Prisma.ListingWhereInput = {};
  if (searchParams.status && searchParams.status !== 'ALL') where.status = searchParams.status as any;
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: 'insensitive' } },
      { author: { phone: { contains: searchParams.q } } }
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { author: { select: { name: true, phone: true } }, district: { select: { name: true } } }
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Объявления</h1>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/listings?status=${t}`}
            className={`rounded-full px-3.5 py-1.5 text-sm transition ${
              (searchParams.status ?? 'ALL') === t ? 'bg-ink text-white' : 'border border-line bg-card text-muted'
            }`}
          >
            {t === 'ALL' ? 'Все' : STATUS_LABEL[t]}
          </Link>
        ))}
        <form className="ml-auto" action="/admin/listings">
          <input name="q" defaultValue={searchParams.q} className="field w-64" placeholder="Поиск по названию или телефону" />
        </form>
      </div>

      <div className="card-q overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="p-4">Объявление</th>
              <th className="p-4">Автор</th>
              <th className="p-4">Цена</th>
              <th className="p-4">Статус</th>
              <th className="p-4">Создано</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {listings.map((l) => (
              <tr key={l.id} className="hover:bg-paper/60">
                <td className="max-w-xs p-4">
                  <Link href={`/listing/${l.id}`} className="font-medium hover:text-brand">
                    {l.title}
                  </Link>
                  <p className="text-xs text-muted">
                    №{l.publicId} · {l.district?.name ?? '—'} · {l.views} просм.
                  </p>
                </td>
                <td className="p-4">
                  <p>{l.author.name}</p>
                  <p className="text-xs text-muted">{l.author.phone}</p>
                </td>
                <td className="p-4 tabular-nums">{tenge(l.price)}</td>
                <td className="p-4">
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
                </td>
                <td className="p-4 text-xs text-muted">{timeAgo(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {listings.length === 0 && <p className="p-8 text-center text-sm text-muted">Ничего не найдено.</p>}
      </div>
    </div>
  );
}
