import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canAccessThread, markThreadRead, threadInclude } from '@/lib/chat';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { getT } from '@/lib/i18n/server';
import { tenge } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const me = await currentUser();
  if (!me) redirect(`/login?callbackUrl=/cabinet/chat/${params.id}`);
  const { t } = getT();

  const thread = await prisma.thread.findUnique({
    where: { id: params.id },
    include: { ...threadInclude, messages: { orderBy: { createdAt: 'asc' }, take: 200 } }
  });
  if (!thread) notFound();
  if (!canAccessThread(thread, me)) notFound();

  await markThreadRead(thread.id, me.id);

  const isSupport = thread.kind === 'SUPPORT';
  const peer = thread.userAId === me.id ? thread.userB : thread.userA;
  const peerName = isSupport ? t.support.moderator : (peer?.name ?? '—');

  return (
    <section>
      <Link href="/cabinet/chat" className="mb-4 inline-flex text-sm text-muted transition hover:text-ink">
        ← {t.chat.title}
      </Link>

      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-xl font-bold">{peerName}</h1>
        {isSupport && (
          <span className="chip">
            {thread.status === 'CLOSED'
              ? t.support.closed
              : thread.status === 'ANSWERED'
                ? t.support.answered
                : t.support.open}
          </span>
        )}
        {thread.listing && (
          <Link
            href={`/listing/${thread.listing.id}`}
            className="ml-auto text-sm text-muted transition hover:text-ink"
          >
            {thread.listing.title} · {tenge(thread.listing.price)}
          </Link>
        )}
      </header>

      {thread.listing && thread.listing.status !== 'ACTIVE' && (
        <p className="mb-3 rounded-2xl bg-card px-4 py-3 text-[13px] text-muted">{t.chat.listingRemoved}</p>
      )}

      <ChatWindow
        threadId={thread.id}
        meId={me.id}
        peerName={peerName}
        closed={thread.status === 'CLOSED' && thread.kind === 'LISTING'}
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

      {!isSupport && (
        <p className="mt-4 text-center text-[13px] text-muted">
          {t.listing.safetyTitle}.{' '}
          <Link href="/safety" className="underline">
            {t.listing.safetyLink}
          </Link>
        </p>
      )}
    </section>
  );
}
