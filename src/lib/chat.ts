import { prisma } from './prisma';
import type { Prisma, ThreadKind } from '@prisma/client';

export const MESSAGE_MAX = 2000;

/**
 * Антифрод для переписки.
 *
 * Мы не блокируем сообщение и не редактируем текст: и то и другое ломает
 * живой диалог и провоцирует уход в WhatsApp. Вместо этого помечаем сообщение
 * флагом, показываем получателю предупреждение и отдаём модератору.
 *
 * Два класса риска на площадке подселения:
 *  1. Предоплата до просмотра — базовый сценарий мошенничества с арендой
 *  2. Быстрый увод в мессенджер — способ выйти из-под модерации
 */
const SCAM_PATTERNS: RegExp[] = [
  /предоплат|аванс|задаток\s+сегодня|переведи(те)?\s+деньги|kaspi\s*(gold|перевод)|каспи\s*голд/i,
  /алдын\s*ала\s*төле|ақша\s*аудар/i,
  /prepay|pay\s+in\s+advance|wire\s+the\s+money|western\s+union/i,
  /бронь\s+за\s+\d|забронирую\s+если\s+переведёшь/i
];

const OFFPLATFORM_PATTERNS: RegExp[] = [
  /\+?7[\s\-()]*\d{3}[\s\-()]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}/, // телефон в тексте
  /(whats\s*app|ватсап|вотсап|telegram|телеграм|@[a-z0-9_]{4,})/i,
  /(instagram|инстаграм|инста)\s*[:\-]?\s*@?[a-z0-9_.]{3,}/i
];

export type MessageRisk = { flagged: boolean; reason: 'SCAM' | 'OFFPLATFORM' | null };

export function assessMessage(body: string): MessageRisk {
  if (SCAM_PATTERNS.some((re) => re.test(body))) return { flagged: true, reason: 'SCAM' };
  if (OFFPLATFORM_PATTERNS.some((re) => re.test(body))) return { flagged: true, reason: 'OFFPLATFORM' };
  return { flagged: false, reason: null };
}

export function normalizeBody(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const body = input.replace(/\r\n/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim();
  if (!body || body.length > MESSAGE_MAX) return null;
  return body;
}

export const threadInclude = {
  listing: { select: { id: true, title: true, price: true, status: true, photos: { select: { url: true }, take: 1 } } },
  userA: { select: { id: true, name: true, avatarUrl: true } },
  userB: { select: { id: true, name: true, avatarUrl: true } },
  assignee: { select: { id: true, name: true } }
} satisfies Prisma.ThreadInclude;

export type ThreadWithPeers = Prisma.ThreadGetPayload<{ include: typeof threadInclude }>;

/** Может ли пользователь читать и писать в тред */
export function canAccessThread(
  thread: { kind: ThreadKind; userAId: string; userBId: string | null },
  user: { id: string; role: string }
): boolean {
  if (thread.userAId === user.id || thread.userBId === user.id) return true;
  // Тикеты поддержки видит вся смена: модератор и админ
  if (thread.kind === 'SUPPORT') return user.role === 'ADMIN' || user.role === 'MODERATOR';
  return false;
}

/** Собеседник в диалоге по объявлению */
export function counterpart(thread: ThreadWithPeers, meId: string) {
  return thread.userAId === meId ? thread.userB : thread.userA;
}

/**
 * Диалог по объявлению. userA — всегда инициатор, userB — автор объявления.
 * Порядок фиксирован, поэтому unique-индекс не создаёт дублей при встречном обращении.
 */
export async function getOrCreateListingThread(listingId: string, initiatorId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, authorId: true, status: true }
  });
  if (!listing) throw new Error('LISTING_NOT_FOUND');
  if (listing.authorId === initiatorId) throw new Error('OWN_LISTING');
  if (listing.status !== 'ACTIVE') throw new Error('LISTING_NOT_ACTIVE');

  const existing = await prisma.thread.findFirst({
    where: {
      listingId,
      kind: 'LISTING',
      OR: [
        { userAId: initiatorId, userBId: listing.authorId },
        { userAId: listing.authorId, userBId: initiatorId }
      ]
    }
  });
  if (existing) return existing;

  return prisma.thread.create({
    data: { kind: 'LISTING', listingId, userAId: initiatorId, userBId: listing.authorId }
  });
}

/**
 * Обращение в поддержку. У пользователя одновременно живёт один открытый тикет:
 * иначе очередь модерации превращается в свалку из десяти веток об одном и том же.
 * Unique-индекс здесь не работает (listingId = NULL не конфликтует в Postgres),
 * поэтому единственность держим тут.
 */
export async function getOrCreateSupportThread(userId: string, subject?: string | null) {
  const open = await prisma.thread.findFirst({
    where: { kind: 'SUPPORT', userAId: userId, status: { in: ['OPEN', 'ANSWERED'] } },
    orderBy: { lastMessageAt: 'desc' }
  });
  if (open) return open;

  return prisma.thread.create({
    data: {
      kind: 'SUPPORT',
      userAId: userId,
      subject: subject?.slice(0, 140) || null,
      status: 'OPEN'
    }
  });
}

/** Непрочитанные для бейджа в шапке */
export async function unreadCount(userId: string) {
  return prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      thread: { OR: [{ userAId: userId }, { userBId: userId }] }
    }
  });
}

export async function markThreadRead(threadId: string, userId: string) {
  await prisma.message.updateMany({
    where: { threadId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() }
  });
}
