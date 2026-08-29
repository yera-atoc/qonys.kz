import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateSupportThread, markThreadRead, normalizeBody } from '@/lib/chat';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { getT } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
  const me = await currentUser();
  if (!me) redirect('/login?callbackUrl=/cabinet/support');
  const { t } = getT();

  const thread = await prisma.thread.findFirst({
    where: { kind: 'SUPPORT', userAId: me.id },
    include: { messages: { orderBy: { createdAt: 'asc' }, take: 200 } },
    orderBy: { lastMessageAt: 'desc' }
  });

  if (thread) await markThreadRead(thread.id, me.id);

  // Первое обращение: тему и первое сообщение принимаем одной формой,
  // чтобы модератор сразу видел суть, а не «здравствуйте».
  async function createTicket(formData: FormData) {
    'use server';
    const user = await currentUser();
    if (!user) redirect('/login');

    const subject = String(formData.get('subject') ?? '').slice(0, 140).trim();
    const body = normalizeBody(formData.get('body'));
    if (!body) return;

    const ticket = await getOrCreateSupportThread(user.id, subject);
    await prisma.$transaction([
      prisma.message.create({ data: { threadId: ticket.id, senderId: user.id, body } }),
      prisma.thread.update({
        where: { id: ticket.id },
        data: { lastMessageAt: new Date(), status: 'OPEN', subject: subject || undefined }
      })
    ]);
    revalidatePath('/cabinet/support');
  }

  return (
    <section>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">{t.support.title}</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">{t.support.subtitle}</p>
      </header>

      {thread ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="chip">
              {thread.status === 'CLOSED'
                ? t.support.closed
                : thread.status === 'ANSWERED'
                  ? t.support.answered
                  : t.support.open}
            </span>
            {thread.subject && <span className="text-sm text-muted">{thread.subject}</span>}
            <span className="ml-auto text-[13px] text-muted">{t.support.slaHint}</span>
          </div>

          <ChatWindow
            threadId={thread.id}
            meId={me.id}
            peerName={t.support.moderator}
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
        </>
      ) : (
        <form action={createTicket} className="card-q max-w-xl space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">{t.support.startTitle}</h2>

          <div>
            <label htmlFor="subject" className="label">
              {t.support.subject}
            </label>
            <input
              id="subject"
              name="subject"
              maxLength={140}
              placeholder={t.support.subjectPlaceholder}
              className="mt-1 w-full rounded-xl border border-line px-4 py-3 text-[15px] outline-none focus:border-ink/30"
            />
          </div>

          <div>
            <label htmlFor="body" className="label">
              {t.support.startTitle}
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={5}
              maxLength={2000}
              className="mt-1 w-full resize-none rounded-xl border border-line px-4 py-3 text-[15px] outline-none focus:border-ink/30"
            />
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" className="btn-primary">
              {t.support.create}
            </button>
            <span className="text-[13px] text-muted">{t.support.slaHint}</span>
          </div>
        </form>
      )}

      <p className="mt-6 text-[13px] text-muted">
        <Link href="/rules" className="underline">
          {t.nav.rules}
        </Link>
        {' · '}
        <Link href="/safety" className="underline">
          {t.nav.safety}
        </Link>
      </p>
    </section>
  );
}
