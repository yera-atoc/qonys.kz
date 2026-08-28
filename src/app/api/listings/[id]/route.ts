import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { listingSchema } from '@/lib/validation';

async function own(id: string, userId: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  return listing && listing.authorId === userId ? listing : null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: 'Войдите в аккаунт' }, { status: 401 });

  const listing = await own(params.id, me.id);
  if (!listing) return NextResponse.json({ error: 'Объявление не найдено' }, { status: 404 });

  const body = await req.json();

  if (body.action === 'bump') {
    const hours = (Date.now() - listing.bumpedAt.getTime()) / 36e5;
    if (hours < 24) {
      return NextResponse.json({ error: 'Бесплатное поднятие доступно раз в сутки' }, { status: 429 });
    }
    await prisma.listing.update({ where: { id: listing.id }, data: { bumpedAt: new Date() } });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'archive') {
    await prisma.listing.update({ where: { id: listing.id }, data: { status: 'ARCHIVED' } });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'republish') {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { status: 'MODERATION', bumpedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 864e5) }
    });
    return NextResponse.json({ ok: true });
  }

  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const d = parsed.data;

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      kind: d.kind,
      title: d.title,
      description: d.description,
      price: d.price,
      deposit: d.deposit,
      housingType: d.housingType,
      rooms: d.rooms,
      city: d.city,
      districtId: d.districtId || null,
      metro: d.metro || null,
      address: d.address || null,
      lat: d.lat ?? null,
      lng: d.lng ?? null,
      preferGender: d.preferGender || null,
      habits: d.habits,
      amenities: d.amenities,
      status: 'MODERATION',
      rejectReason: null
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: 'Войдите в аккаунт' }, { status: 401 });

  const listing = await own(params.id, me.id);
  if (!listing) return NextResponse.json({ error: 'Объявление не найдено' }, { status: 404 });

  await prisma.listing.delete({ where: { id: listing.id } });
  return NextResponse.json({ ok: true });
}
