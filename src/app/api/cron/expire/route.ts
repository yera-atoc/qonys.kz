import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Гасит истёкшие продвижения объявлений и тарифы риелторов.
 *
 * Vercel Cron дёргает этот путь по расписанию из vercel.json и сам
 * добавляет заголовок Authorization: Bearer $CRON_SECRET — см.
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 * Тот же секрет подходит и для ручного вызова через curl (см. README):
 *   curl -H "x-cron-key: $CRON_SECRET" https://qonys.kz/api/cron/expire
 */
function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;

  // Без настроенного секрета не пускаем никого в проде.
  // В деве/превью — пропускаем, чтобы можно было гонять руками без .env.
  if (!secret) return process.env.NODE_ENV !== 'production';

  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;

  const cronKey = req.headers.get('x-cron-key');
  if (cronKey === secret) return true;

  return false;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // 1. Гасим истёкшие продвижения объявлений (ТОП, «Срочно», поднятие).
  const expiredPromotions = await prisma.promotion.findMany({
    where: { isActive: true, endsAt: { lte: now } },
    select: { id: true, listingId: true }
  });

  let listingsReset = 0;
  if (expiredPromotions.length > 0) {
    await prisma.promotion.updateMany({
      where: { id: { in: expiredPromotions.map((p) => p.id) } },
      data: { isActive: false }
    });

    // Сбрасываем ранг объявления, только если у него не осталось
    // других активных продвижений (могли купить два пакета подряд).
    const listingIds = [...new Set(expiredPromotions.map((p) => p.listingId))];
    for (const listingId of listingIds) {
      const stillActive = await prisma.promotion.findFirst({
        where: { listingId, isActive: true, endsAt: { gt: now } }
      });
      if (!stillActive) {
        await prisma.listing.update({ where: { id: listingId }, data: { rank: 0 } });
        listingsReset += 1;
      }
    }
  }

  // 2. Гасим истёкшие тарифы риелторов и возвращаем роль USER,
  //    если у пользователя не осталось других активных подписок.
  const expiredSubscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE', endsAt: { lte: now } },
    select: { id: true, userId: true }
  });

  let usersDowngraded = 0;
  if (expiredSubscriptions.length > 0) {
    await prisma.subscription.updateMany({
      where: { id: { in: expiredSubscriptions.map((s) => s.id) } },
      data: { status: 'EXPIRED' }
    });

    const userIds = [...new Set(expiredSubscriptions.map((s) => s.userId))];
    for (const userId of userIds) {
      const stillActive = await prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE', endsAt: { gt: now } }
      });
      if (!stillActive) {
        await prisma.user.update({ where: { id: userId }, data: { role: 'USER' } });
        usersDowngraded += 1;
      }
    }
  }

  // 3. Снимаем с публикации объявления с истёкшим сроком размещения.
  const expiredListings = await prisma.listing.updateMany({
    where: { status: 'ACTIVE', expiresAt: { lte: now } },
    data: { status: 'EXPIRED' }
  });

  return NextResponse.json({
    ok: true,
    promotionsExpired: expiredPromotions.length,
    listingsReset,
    subscriptionsExpired: expiredSubscriptions.length,
    usersDowngraded,
    listingsExpired: expiredListings.count
  });
}
