import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';

export async function POST(req: Request) {
  const me = await currentUser();
  const { listingId, reason, comment } = await req.json();

  if (!listingId || !reason) {
    return NextResponse.json({ error: 'Укажите причину жалобы' }, { status: 400 });
  }

  await prisma.complaint.create({
    data: { listingId, reason: String(reason).slice(0, 120), comment: comment ? String(comment).slice(0, 1000) : null, authorId: me?.id }
  });

  return NextResponse.json({ ok: true });
}
