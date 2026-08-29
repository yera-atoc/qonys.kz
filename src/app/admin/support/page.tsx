import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Ждёт ответа',
  ANSWERED: 'Отвечено',
  CLOSED: 'Закрыто'
};

// Админка остаётся на русском: это внутренний инструмент смены модерации,
// её локализация не окупается и только размывает словарь витрины.
export default async function AdminSupportPage({
  searchParams
}: {
  searchParams: { status?: string };
}) {
  const me = await currentUser();
  if (!me || (me.role !== 'ADMIN' && me.role !== 'MODERATOR')) redirect('/cabinet');

  const status = searchParams.status ?? 'OPEN';

  const [threads, counts] = await Promise.all([
    prisma.thread.findMany({
      where: { kind: 'SUPPORT', ...(status === 'ALL' ? {} : { status: status as any }) },
      include: {
        userA: { select: { id: true, name: true, phone: true } },
        assignee: { select: { name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: true } }
      },
      orderBy: { lastMessageAt: 'asc' }, // самые залежавшиеся — сверху
      take: 100
    }),
    prisma.thread.groupBy({ by: ['status'], where: { kind: 'SUPPORT' }, _count: true })
  ]);

  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <section>
      <h1 className="mb-1 font-display text-2xl font-bold">Поддержка</h1>
      <p className="mb-6 text-sm text-muted">Обращения пользователей. Первыми — те, что дольше всего без ответа</p>

      <nav className="mb-5 flex flex-wrap gap-2">
        {['OPEN', 'ANSWERED', 'CLOSED', 'ALL'].map((s) => (
          <Link
            key={s}
            href={`/admin/support?status=${s}`}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              status === s ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:border-ink/25'
            }`}
          >
            {s === 'ALL' ? 'Все' : STATUS_LABEL[s]}
            {s !== 'ALL' && <span className="ml-2 opacity-60">{countOf(s)}</span>}
          </Link>
        ))}
      </nav>

      {threads.length === 0 ? (
        <p className="card-q p-10 text-center text-muted">Обращений в этом статусе нет</p>
      ) : (
        <ul className="space-y-2">
          {threads.map((thread) => {
            const waiting = Math.floor((Date.now() - thread.lastMessageAt.getTime()) / 3600_000);
            const stale = thread.status === 'OPEN' && waiting >= 24;
            return (
              <li key={thread.id}>
                <Link
                  href={`/admin/support/${thread.id}`}
                  className="block rounded-2xl border border-line bg-white p-4 transition hover:border-ink/20"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{thread.userA.name}</span>
                    <span className="text-[13px] text-muted">{thread.userA.phone}</span>
                    <span className={`chip ${stale ? 'border-danger text-danger' : ''}`}>
                      {waiting < 1 ? 'только что' : `${waiting} ч без ответа`}
                    </span>
                    {thread.assignee && (
                      <span className="text-[13px] text-muted">на {thread.assignee.name}</span>
                    )}
                    <span className="ml-auto text-[13px] text-muted">{thread._count.messages} сообщ.</span>
                  </div>
                  {thread.subject && <p className="mt-1 text-sm font-medium">{thread.subject}</p>}
                  <p className="mt-1 truncate text-sm text-muted">{thread.messages[0]?.body ?? '—'}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
