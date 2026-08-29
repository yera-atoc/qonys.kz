import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { getOrCreateListingThread, getOrCreateSupportThread, threadInclude } from '@/lib/chat';

export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const threads = await prisma.thread.findMany({
    where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    include: threadInclude,
    orderBy: { lastMessageAt: 'desc' },
    take: 100
  });

  return NextResponse.json({ threads });
}

export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const limited = rateLimit(`thread:create:${me.id}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'RATE_LIMITED', retryAfter: limited.retryAfter }, { status: 429 });
  }

  const { kind, listingId, subject } = await req.json().catch(() => ({}));

  try {
    if (kind === 'SUPPORT') {
      const thread = await getOrCreateSupportThread(me.id, subject);
      return NextResponse.json({ ok: true, id: thread.id });
    }

    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json({ error: 'LISTING_REQUIRED' }, { status: 400 });
    }

    const thread = await getOrCreateListingThread(listingId, me.id);
    return NextResponse.json({ ok: true, id: thread.id });
  } catch (e) {
    const code = e instanceof Error ? e.message : 'UNKNOWN';
    const status = code === 'LISTING_NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ error: code }, { status });
  }
}
