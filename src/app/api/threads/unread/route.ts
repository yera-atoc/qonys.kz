import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { unreadCount } from '@/lib/chat';

export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ count: 0 });
  return NextResponse.json({ count: await unreadCount(me.id) });
}
