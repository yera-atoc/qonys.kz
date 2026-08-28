import Link from 'next/link';
import { tenge, timeAgo, KIND_LABEL, HOUSING_LABEL, OCCUPATION_LABEL } from '@/lib/format';

export type ListingCardData = {
  id: string;
  kind: string;
  title: string;
  price: number;
  rooms: number;
  metro: string | null;
  housingType: string;
  bumpedAt: Date | string;
  district: { name: string } | null;
  author: { name: string; birthYear: number | null; occupation: string | null };
  promoTypes: string[];
  photoUrl?: string | null;
  habits?: string[];
};

/** Пока фото нет — рисуем узнаваемую заглушку вместо пустого места */
function Placeholder({ seed, kind }: { seed: string; kind: string }) {
  const hues = [
    'from-[#0F6B57] to-[#134E43]',
    'from-[#1B5E7E] to-[#0E3B52]',
    'from-[#7A5B2E] to-[#4E3A1C]',
    'from-[#5B4A7A] to-[#3A2F52]'
  ];
  const tone = hues[seed.charCodeAt(seed.length - 1) % hues.length];

  return (
    <div className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${tone}`}>
      <svg viewBox="0 0 48 48" className="h-11 w-11 text-white/35" fill="none" stroke="currentColor" strokeWidth="2">
        {kind === 'OFFER_ROOM' ? (
          <>
            <path d="M8 20 24 8l16 12v18a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" strokeLinejoin="round" />
            <path d="M20 40V28h8v12" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <circle cx="18" cy="18" r="6" />
            <circle cx="32" cy="21" r="5" />
            <path d="M8 40c0-5.5 4.5-10 10-10s10 4.5 10 10" strokeLinecap="round" />
            <path d="M30 40c0-4 2-7.5 5-9" strokeLinecap="round" />
          </>
        )}
      </svg>
      <span className="absolute bottom-2 right-2 rounded-md bg-black/25 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
        без фото
      </span>
    </div>
  );
}

export function ListingCard({ item }: { item: ListingCardData }) {
  const isTop = item.promoTypes.includes('TOP');
  const isUrgent = item.promoTypes.includes('URGENT');
  const isHighlight = item.promoTypes.includes('HIGHLIGHT');
  const age = item.author.birthYear ? new Date().getFullYear() - item.author.birthYear : null;
  const initials = item.author.name.slice(0, 2).toUpperCase();
  const location = [item.district?.name, item.metro ? `м. ${item.metro}` : null].filter(Boolean).join(' · ');

  return (
    <Link
      href={`/listing/${item.id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-all
                  duration-200 hover:-translate-y-1 hover:shadow-pop
                  ${isHighlight ? 'border-accent ring-1 ring-accent/30' : 'border-line'}`}
    >
      {/* Фото */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-line/40">
        {item.photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.photoUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <Placeholder seed={item.id} kind={item.kind} />
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">
            {KIND_LABEL[item.kind]}
          </span>
          {isTop && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm">ТОП</span>
          )}
          {isUrgent && (
            <span className="rounded-full bg-danger px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">Срочно</span>
          )}
        </div>
      </div>

      {/* Контент */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[22px] font-bold leading-none tracking-tight">{tenge(item.price)}</span>
          <span className="text-xs text-muted">в месяц</span>
        </div>

        <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-snug transition-colors group-hover:text-brand">
          {item.title}
        </h3>

        <p className="mt-2 line-clamp-1 text-[13px] text-muted">{location || 'Алматы'}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="chip">{item.rooms}-комн.</span>
          <span className="chip">{HOUSING_LABEL[item.housingType]}</span>
          {item.habits?.slice(0, 1).map((h) => (
            <span key={h} className="chip">{h}</span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3.5 text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-ink">
              {initials}
            </span>
            <span className="truncate text-muted">
              <span className="font-medium text-ink">
                {item.author.name}
                {age ? `, ${age}` : ''}
              </span>
              {item.author.occupation ? ` · ${OCCUPATION_LABEL[item.author.occupation]}` : ''}
            </span>
          </div>
          <span className="shrink-0 text-muted">{timeAgo(item.bumpedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

/** Карточка-заглушка на время загрузки ленты */
export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="aspect-[16/10] w-full skeleton rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-6 w-32" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-2 border-t border-line pt-3">
          <div className="skeleton h-7 w-7 rounded-full" />
          <div className="skeleton h-4 w-28" />
        </div>
      </div>
    </div>
  );
}
