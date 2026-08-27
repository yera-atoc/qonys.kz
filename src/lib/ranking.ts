import type { Listing, Promotion } from '@prisma/client';

/**
 * Вес объявления в ленте: платное продвижение поднимает выше,
 * но свежесть и заполненность анкеты тоже влияют.
 */
export function computeRank(listing: Listing & { promotions?: Promotion[] }) {
  const now = Date.now();
  const active = (listing.promotions ?? []).filter((p) => p.isActive && p.endsAt.getTime() > now);

  let score = 0;
  if (active.some((p) => p.type === 'TOP')) score += 1000;
  if (active.some((p) => p.type === 'URGENT')) score += 300;
  if (active.some((p) => p.type === 'HIGHLIGHT')) score += 100;

  const hoursSinceBump = (now - listing.bumpedAt.getTime()) / 36e5;
  score += Math.max(0, 200 - hoursSinceBump * 2); // затухание свежести

  if (listing.description.length > 200) score += 20;
  if (listing.habits.length >= 3) score += 15;

  return Math.round(score * 100) / 100;
}

export function activeTypes(promotions: Promotion[] = []) {
  const now = Date.now();
  return new Set(promotions.filter((p) => p.isActive && p.endsAt.getTime() > now).map((p) => p.type));
}
