import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const me = await currentUser();
  if (me?.role !== 'ADMIN') return NextResponse.json({ error: 'Нужны права администратора' }, { status: 403 });

  const body = await req.json();
  const target = await prisma.user.findUnique({ where: { id: params.id }, include: { wallet: true } });
  if (!target) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  if (target.role === 'ADMIN') return NextResponse.json({ error: 'Нельзя менять другого администратора' }, { status: 403 });

  if (body.status) {
    await prisma.user.update({ where: { id: target.id }, data: { status: body.status } });
    if (body.status === 'BLOCKED') {
      await prisma.listing.updateMany({ where: { authorId: target.id, status: 'ACTIVE' }, data: { status: 'ARCHIVED' } });
    }
  }

  if (body.role) {
    await prisma.user.update({ where: { id: target.id }, data: { role: body.role } });
  }

  if (typeof body.adjustBalance === 'number' && body.adjustBalance !== 0) {
    const wallet = await prisma.wallet.upsert({
      where: { userId: target.id },
      update: {},
      create: { userId: target.id }
    });
    const updated = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: body.adjustBalance } }
    });
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'ADMIN_ADJUST',
        amount: body.adjustBalance,
        balanceAfter: updated.balance + updated.bonusBalance,
        comment: 'Корректировка администратором'
      }
    });
  }

  await prisma.adminLog.create({
    data: { adminId: me.id, action: 'user.update', entity: 'User', entityId: target.id, payload: body }
  });

  return NextResponse.json({ ok: true });
}
