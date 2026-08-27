export const tenge = (v: number) => new Intl.NumberFormat('ru-KZ').format(v) + ' ₸';

export const shortTenge = (v: number) =>
  v >= 1_000_000 ? (v / 1_000_000).toFixed(1).replace('.0', '') + ' млн ₸' : tenge(v);

export function timeAgo(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'вчера';
  if (days < 30) return `${days} дн назад`;
  return d.toLocaleDateString('ru-RU');
}

export const KIND_LABEL: Record<string, string> = {
  OFFER_ROOM: 'Сдаёт комнату',
  SEEK_ROOMMATE: 'Ищет соседа'
};

export const HOUSING_LABEL: Record<string, string> = {
  SEPARATE_ROOM: 'Отдельная комната',
  SHARED_ROOM: 'Делить комнату',
  BED_SPACE: 'Койко-место'
};

export const OCCUPATION_LABEL: Record<string, string> = {
  STUDENT: 'Студент(ка)',
  WORKING: 'Работает',
  REMOTE: 'Удалёнка',
  OTHER: 'Другое'
};

export const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Черновик',
  MODERATION: 'На проверке',
  ACTIVE: 'Опубликовано',
  REJECTED: 'Отклонено',
  ARCHIVED: 'В архиве',
  EXPIRED: 'Истекло'
};

export const PROMO_LABEL: Record<string, string> = {
  TOP: 'ТОП ленты',
  URGENT: 'Срочно',
  HIGHLIGHT: 'Выделение',
  BUMP: 'Поднятие',
  PHOTO_PACK: 'Фотопакет'
};
