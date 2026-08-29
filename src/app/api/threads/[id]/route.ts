import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { canAccessThread, threadInclude } from '@/lib/chat';

/** Закрыть / переоткрыть / взять тикет в работу */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const thread = await prisma.thread.findUnique({ where: { id: params.id }, include: threadInclude });
  if (!thread) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (!canAccessThread(thread, me)) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  const { action } = await req.json().catch(() => ({}));
  const isStaff = me.role === 'ADMIN' || me.role === 'MODERATOR';

  if (action === 'close') {
    // Закрыть тикет может модератор или сам автор обращения
    if (!isStaff && thread.userAId !== me.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }
    await prisma.$transaction([
      prisma.thread.update({
        where: { id: thread.id },
        data: { status: 'CLOSED', closedAt: new Date() }
      }),
      prisma.message.create({
        data: { threadId: thread.id, body: 'THREAD_CLOSED', isSystem: true, senderId: null }
      })
    ]);
    return NextResponse.json({ ok: true });
  }

  if (action === 'assign') {
    if (!isStaff) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    await prisma.thread.update({ where: { id: thread.id }, data: { assigneeId: me.id } });
    return NextResponse.json({ ok: true });
  }

  if (action === 'reopen') {
    await prisma.thread.update({
      where: { id: thread.id },
      data: { status: 'OPEN', closedAt: null }
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'UNKNOWN_ACTION' }, { status: 400 });
}
