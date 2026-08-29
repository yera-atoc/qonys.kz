import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { markThreadRead } from '@/lib/chat';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { SupportActions } from '@/components/admin/SupportActions';
import { tenge } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminSupportThread({ params }: { params: { id: string } }) {
  const me = await currentUser();
  if (!me || (me.role !== 'ADMIN' && me.role !== 'MODERATOR')) redirect('/cabinet');

  const thread = await prisma.thread.findUnique({
    where: { id: params.id },
    include: {
      userA: {
        select: {
          id: true,
          name: true,
          phone: true,
          createdAt: true,
          status: true,
          wallet: { select: { balance: true, bonusBalance: true } },
          _count: { select: { listings: true, complaintsMade: true } }
        }
      },
      assignee: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: 'asc' }, take: 200 }
    }
  });
  if (!thread || thread.kind !== 'SUPPORT') notFound();

  await markThreadRead(thread.id, me.id);

  const user = thread.userA;

  return (
    <section>
      <Link href="/admin/support" className="mb-4 inline-flex text-sm text-muted transition hover:text-ink">
        ← Поддержка
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold">{thread.subject || 'Обращение без темы'}</h1>
          <p className="mb-4 text-sm text-muted">
            {user.name} · {user.phone}
          </p>

          <ChatWindow
            threadId={thread.id}
            meId={me.id}
            peerName={user.name}
            asSupport
            closed={thread.status === 'CLOSED'}
            initialMessages={thread.messages.map((m) => ({
              id: m.id,
              senderId: m.senderId,
              body: m.body,
              isSystem: m.isSystem,
              flagged: m.flagged,
              readAt: m.readAt,
              createdAt: m.createdAt
            }))}
          />
        </div>

        {/* Контекст рядом с перепиской: модератору не нужно уходить в другой раздел,
            чтобы понять, с кем он говорит */}
        <aside className="space-y-4">
          <SupportActions threadId={thread.id} status={thread.status} assigneeId={thread.assigneeId} meId={me.id} />

          <div className="card-q p-4 text-sm">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted">Пользователь</p>
            <dl className="space-y-1.5">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Регистрация</dt>
                <dd>{user.createdAt.toLocaleDateString('ru-RU')}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Статус</dt>
                <dd>{user.status}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Баланс</dt>
                <dd>{tenge((user.wallet?.balance ?? 0) + (user.wallet?.bonusBalance ?? 0))}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Объявлений</dt>
                <dd>{user._count.listings}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Жалоб подал</dt>
                <dd>{user._count.complaintsMade}</dd>
              </div>
            </dl>
            <Link href={`/admin/users?q=${encodeURIComponent(user.phone)}`} className="btn-ghost btn-sm mt-4 w-full">
              Открыть в пользователях
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
