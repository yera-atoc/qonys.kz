import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';

export async function POST(req: Request) {
  const parsed = registerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  const exists = await prisma.user.findUnique({ where: { phone } });
  if (exists) {
    return NextResponse.json({ error: 'Этот номер уже зарегистрирован' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      phone,
      name: parsed.data.name,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      status: 'ACTIVE', // замените на PENDING_PHONE, когда подключите SMS-подтверждение
      wallet: { create: { bonusBalance: 500 } } // приветственный бонус
    }
  });

  return NextResponse.json({ id: user.id });
}
