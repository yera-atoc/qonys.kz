import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhook } from '@/lib/payments';
import { topUp } from '@/lib/billing';

/**
 * Вебхук платёжного провайдера.
 * Ожидает { orderId, status, externalId } и подпись в заголовке x-signature.
 */
export async function POST(req: Request) {
  const raw = await req.text();

  if (!verifyWebhook(raw, req.headers.get('x-signature'))) {
    return NextResponse.json({ error: 'Некорректная подпись' }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Некорректное тело запроса' }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({ where: { id: body.orderId } });
  if (!payment) return NextResponse.json({ error: 'Платёж не найден' }, { status: 404 });

  // Идемпотентность: повторный вебхук не должен зачислять деньги дважды
  if (payment.status === 'PAID') return NextResponse.json({ ok: true, duplicate: true });

  if (body.status !== 'PAID' && body.status !== 'success') {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
    return NextResponse.json({ ok: true });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'PAID', paidAt: new Date(), externalId: body.externalId ?? payment.externalId }
  });

  await topUp(payment.userId, payment.amount, 'Пополнение баланса', payment.id);

  return NextResponse.json({ ok: true });
}
