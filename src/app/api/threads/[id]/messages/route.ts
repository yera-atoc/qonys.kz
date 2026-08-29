import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { assessMessage, canAccessThread, markThreadRead, normalizeBody } from '@/lib/chat';

const PAGE = 200;

/** Лента сообщений. ?after=<ISO> — только новые, для дешёвого поллинга. */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const thread = await prisma.thread.findUnique({
    where: { id: params.id },
    select: { id: true, kind: true, userAId: true, userBId: true, status: true }
  });
  if (!thread) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (!canAccessThread(thread, me)) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  const after = new URL(req.url).searchParams.get('after');
  const messages = await prisma.message.findMany({
    where: {
      threadId: thread.id,
      ...(after ? { createdAt: { gt: new Date(after) } } : {})
    },
    orderBy: { createdAt: 'asc' },
    take: PAGE,
    select: {
      id: true,
      senderId: true,
      body: true,
      isSystem: true,
      flagged: true,
      readAt: true,
      createdAt: true
    }
  });

  // Открыли тред — значит прочитали
  await markThreadRead(thread.id, me.id);

  return NextResponse.json({ messages, status: thread.status });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  // 20 сообщений в минуту: живая переписка проходит, скрипт — нет
  const limited = rateLimit(`msg:${me.id}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'RATE_LIMITED', retryAfter: limited.retryAfter }, { status: 429 });
  }

  const thread = await prisma.thread.findUnique({
    where: { id: params.id },
    select: { id: true, kind: true, status: true, userAId: true, userBId: true, listingId: true }
  });
  if (!thread) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (!canAccessThread(thread, me)) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  const body = normalizeBody((await req.json().catch(() => ({}))).body);
  if (!body) return NextResponse.json({ error: 'EMPTY_OR_TOO_LONG' }, { status: 400 });

  const isStaff = me.role === 'ADMIN' || me.role === 'MODERATOR';

  // Закрытый тикет переоткрывается сообщением пользователя, а не отдельной кнопкой
  const nextStatus =
    thread.kind === 'SUPPORT' ? (isStaff ? 'ANSWERED' : 'OPEN') : thread.status === 'CLOSED' ? 'CLOSED' : 'OPEN';

  if (thread.kind === 'LISTING' && thread.status === 'CLOSED') {
    return NextResponse.json({ error: 'THREAD_CLOSED' }, { status: 403 });
  }

  // Модератора не проверяем антифродом: он по работе пишет про возвраты и переводы
  const risk = isStaff ? { flagged: false } : assessMessage(body);

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { threadId: thread.id, senderId: me.id, body, flagged: risk.flagged },
      select: { id: true, senderId: true, body: true, isSystem: true, flagged: true, readAt: true, createdAt: true }
    }),
    prisma.thread.update({
      where: { id: thread.id },
      data: {
        lastMessageAt: new Date(),
        status: nextStatus,
        ...(thread.kind === 'SUPPORT' && isStaff ? { assigneeId: me.id, closedAt: null } : {}),
        ...(thread.kind === 'SUPPORT' && !isStaff ? { closedAt: null } : {})
      }
    })
  ]);

  return NextResponse.json({ ok: true, message });
}
