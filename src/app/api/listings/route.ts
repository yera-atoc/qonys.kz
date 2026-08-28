import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { listingSchema } from '@/lib/validation';

export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: 'Войдите в аккаунт' }, { status: 401 });

  const body = await req.json();
  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const d = parsed.data;

  const [activeCount, subscription, freeLimit] = await Promise.all([
    prisma.listing.count({ where: { authorId: me.id, status: { in: ['ACTIVE', 'MODERATION'] } } }),
    prisma.subscription.findFirst({
      where: { userId: me.id, status: 'ACTIVE', endsAt: { gt: new Date() } },
      include: { plan: true }
    }),
    prisma.setting.findUnique({ where: { key: 'free_listings_per_user' } })
  ]);

  const limit = subscription?.plan.listingLimit ?? Number(freeLimit?.value ?? 2);
  if (activeCount >= limit) {
    return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 403 });
  }

  const listing = await prisma.listing.create({
    data: {
      authorId: me.id,
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
      minAge: d.minAge ?? null,
      maxAge: d.maxAge ?? null,
      habits: d.habits,
      amenities: d.amenities,
      status: 'MODERATION',
      publishedAt: null,
      expiresAt: new Date(Date.now() + 30 * 864e5)
    }
  });

  return NextResponse.json({ ok: true, id: listing.id });
}
