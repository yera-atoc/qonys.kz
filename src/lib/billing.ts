import { prisma } from './prisma';
import { PromoType, TxType } from '@prisma/client';

/** Списание с кошелька. Атомарно, с записью в историю. */
export async function charge(userId: string, amount: number, comment: string, refId?: string) {
  if (amount <= 0) throw new Error('Сумма должна быть больше нуля');
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error('Кошелёк не найден');

    const total = wallet.balance + wallet.bonusBalance;
    if (total < amount) throw new Error('INSUFFICIENT_FUNDS');

    // сначала тратим бонусы, затем основной баланс
    const fromBonus = Math.min(wallet.bonusBalance, amount);
    const fromMain = amount - fromBonus;

    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { bonusBalance: { decrement: fromBonus }, balance: { decrement: fromMain } }
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: TxType.PURCHASE,
        amount: -amount,
        balanceAfter: updated.balance + updated.bonusBalance,
        comment,
        refId
      }
    });
    return updated;
  });
}

/** Пополнение кошелька после успешной оплаты. */
export async function topUp(userId: string, amount: number, comment = 'Пополнение баланса', refId?: string, bonus = 0) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });
    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount }, bonusBalance: { increment: bonus } }
    });
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: TxType.TOPUP,
        amount,
        balanceAfter: updated.balance + updated.bonusBalance,
        comment,
        refId
      }
    });
    return updated;
  });
}

/** Покупка продвижения объявления. */
export async function buyPromotion(userId: string, listingId: string, packageId: string) {
  const [listing, pack] = await Promise.all([
    prisma.listing.findUnique({ where: { id: listingId } }),
    prisma.promoPackage.findUnique({ where: { id: packageId } })
  ]);
  if (!listing || listing.authorId !== userId) throw new Error('FORBIDDEN');
  if (!pack?.isActive) throw new Error('Пакет недоступен');

  await charge(userId, pack.price, `Продвижение: ${pack.title}`, listingId);

  const endsAt = new Date(Date.now() + pack.days * 864e5);
  const promo = await prisma.promotion.create({
    data: { listingId, packageId: pack.id, type: pack.type, amount: pack.price, endsAt }
  });

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      bumpedAt: new Date(),
      rank: pack.type === PromoType.TOP ? 100 : pack.type === PromoType.URGENT ? 50 : listing.rank + 10
    }
  });

  return promo;
}

/** Оформление тарифа риелтора. */
export async function subscribe(userId: string, planId: string) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan?.isActive) throw new Error('Тариф недоступен');

  await charge(userId, plan.price, `Тариф «${plan.title}»`, plan.id);

  const endsAt = new Date(Date.now() + 30 * 864e5);
  const sub = await prisma.subscription.create({ data: { userId, planId, endsAt } });
  await prisma.user.update({ where: { id: userId }, data: { role: 'AGENT' } });
  return sub;
}

/** Открытие контактов автора за плату. */
export async function unlockContact(userId: string, listingId: string) {
  const existing = await prisma.contactUnlock.findUnique({
    where: { userId_listingId: { userId, listingId } }
  });
  if (existing) return existing;

  const setting = await prisma.setting.findUnique({ where: { key: 'contact_unlock_price' } });
  const price = Number(setting?.value ?? 300);

  await charge(userId, price, 'Открытие контактов', listingId);
  await prisma.listing.update({ where: { id: listingId }, data: { contactViews: { increment: 1 } } });
  return prisma.contactUnlock.create({ data: { userId, listingId, amount: price } });
}
