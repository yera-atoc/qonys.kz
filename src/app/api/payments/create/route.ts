import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { topUpSchema } from '@/lib/validation';
import { createPayment } from '@/lib/payments';
import { topUp } from '@/lib/billing';

export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: 'Войдите в аккаунт' }, { status: 401 });

  const parsed = topUpSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const idempotencyKey = crypto.randomUUID();
  const payment = await prisma.payment.create({
    data: {
      userId: me.id,
      amount: parsed.data.amount,
      provider: process.env.PAYMENT_PROVIDER ?? 'mock',
      purpose: 'TOPUP',
      idempotencyKey
    }
  });

  const result = await createPayment({
    amount: payment.amount,
    orderId: payment.id,
    description: 'Пополнение баланса Qonys.kz',
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/cabinet/billing`
  });

  await prisma.payment.update({ where: { id: payment.id }, data: { externalId: result.externalId } });

  // В режиме mock деньги зачисляются сразу — удобно для локальной разработки
  if ((process.env.PAYMENT_PROVIDER ?? 'mock') === 'mock') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID', paidAt: new Date() }
    });
    await topUp(me.id, payment.amount, 'Пополнение баланса', payment.id);
    return NextResponse.json({ ok: true, mock: true });
  }

  return NextResponse.json({ redirectUrl: result.redirectUrl, paymentId: payment.id });
}
