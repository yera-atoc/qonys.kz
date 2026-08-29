import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { threadInclude } from '@/lib/chat';
import { getT } from '@/lib/i18n/server';
import { LOCALE_META } from '@/lib/i18n';
import { tenge } from '@/lib/format';

export async function ThreadList({ meId, basePath = '/cabinet/chat' }: { meId: string; basePath?: string }) {
  const { locale, t } = getT();

  const threads = await prisma.thread.findMany({
    where: { OR: [{ userAId: meId }, { userBId: meId }] },
    include: {
      ...threadInclude,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { messages: { where: { readAt: null, senderId: { not: meId } } } } }
    },
    orderBy: { lastMessageAt: 'desc' },
    take: 50
  });

  if (!threads.length) {
    return (
      <div className="card-q p-10 text-center">
        <p className="font-display text-lg font-semibold">{t.chat.empty}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{t.chat.emptyHint}</p>
        <Link href="/" className="btn-ghost mt-5 inline-flex">
          {t.nav.feed}
        </Link>
      </div>
    );
  }

  const dateFmt = new Intl.DateTimeFormat(LOCALE_META[locale].intl, { day: 'numeric', month: 'short' });

  return (
    <ul className="space-y-2">
      {threads.map((thread) => {
        const peer = thread.userAId === meId ? thread.userB : thread.userA;
        const isSupport = thread.kind === 'SUPPORT';
        const title = isSupport ? t.support.moderator : (peer?.name ?? '—');
        const preview = thread.messages[0];
        const unread = thread._count.messages;

        return (
          <li key={thread.id}>
            <Link
              href={`${basePath}/${thread.id}`}
              className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-ink/20"
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                  isSupport ? 'bg-ink text-white' : 'bg-card text-ink'
                }`}
              >
                {isSupport ? 'Q' : title.slice(0, 2).toUpperCase()}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="truncate font-medium text-ink">{title}</span>
                  <span className="ml-auto shrink-0 text-[12px] text-muted">
                    {dateFmt.format(thread.lastMessageAt)}
                  </span>
                </span>

                {thread.listing && (
                  <span className="mt-0.5 block truncate text-[13px] text-muted">
                    {t.chat.aboutListing}: {thread.listing.title} · {tenge(thread.listing.price)}
                  </span>
                )}
                {isSupport && thread.subject && (
                  <span className="mt-0.5 block truncate text-[13px] text-muted">{thread.subject}</span>
                )}

                <span className="mt-1 flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm text-muted">
                    {preview?.isSystem ? t.support.closed : (preview?.body ?? '—')}
                  </span>
                  {unread > 0 && (
                    <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-ink">
                      {unread}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
