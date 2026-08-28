import Link from 'next/link';
import { tenge, timeAgo, KIND_LABEL, OCCUPATION_LABEL } from '@/lib/format';

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
};

export function ListingCard({ item }: { item: ListingCardData }) {
  const isTop = item.promoTypes.includes('TOP');
  const isUrgent = item.promoTypes.includes('URGENT');
  const age = item.author.birthYear ? new Date().getFullYear() - item.author.birthYear : null;
  const initials = item.author.name.slice(0, 2).toUpperCase();
  const location = [item.district?.name, item.metro ? `м. ${item.metro}` : null, `${item.rooms}-комн.`]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={`/listing/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card
                 transition-all duration-200 hover:-translate-y-1 hover:shadow-pop"
    >
      {/* Фото */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-subtle">
        {item.photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.photoUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg viewBox="0 0 48 48" className="h-10 w-10 text-line" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 20 24 8l16 12v18a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" strokeLinejoin="round" />
              <path d="M20 40V28h8v12" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="pill pill-dot backdrop-blur-sm">{KIND_LABEL[item.kind]}</span>
          {isTop && <span className="pill border-gold bg-gold font-semibold">ТОП</span>}
          {isUrgent && <span className="pill border-danger/20 bg-danger text-white">Срочно</span>}
        </div>
      </div>

      {/* Контент */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="line-clamp-2 font-display text-[17px] font-bold leading-snug tracking-tight">
            {item.title}
          </h3>
          <div className="shrink-0 text-right">
            <p className="whitespace-nowrap font-display text-[17px] font-bold leading-none">{tenge(item.price)}</p>
            <p className="mt-1 text-[13px] text-muted">в месяц</p>
          </div>
        </div>

        <p className="mt-3 text-[14px] text-muted">{location}</p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-subtle text-[11px] font-semibold text-muted">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium leading-tight">
                {item.author.name}
                {age ? `, ${age}` : ''}
              </p>
              <p className="truncate text-[13px] leading-tight text-muted">
                {item.author.occupation ? OCCUPATION_LABEL[item.author.occupation] : '—'}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-[13px] text-muted">{timeAgo(item.bumpedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="aspect-[4/3] w-full skeleton rounded-none" />
      <div className="space-y-3 p-5">
        <div className="flex justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
          <div className="skeleton h-5 w-24" />
        </div>
        <div className="skeleton h-4 w-1/2" />
        <div className="flex items-center gap-3 border-t border-line pt-4">
          <div className="skeleton h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <div className="skeleton h-3.5 w-24" />
            <div className="skeleton h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
