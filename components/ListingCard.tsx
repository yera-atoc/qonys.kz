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
};

export function ListingCard({ item }: { item: ListingCardData }) {
  const isTop = item.promoTypes.includes('TOP');
  const isUrgent = item.promoTypes.includes('URGENT');
  const isHighlight = item.promoTypes.includes('HIGHLIGHT');
  const age = item.author.birthYear ? new Date().getFullYear() - item.author.birthYear : null;
  const initials = item.author.name.slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/listing/${item.id}`}
      className={`card-q group block p-5 transition hover:-translate-y-0.5 hover:shadow-pop ${
        isHighlight ? 'border-accent bg-accent-soft/40' : ''
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`chip ${
            item.kind === 'OFFER_ROOM' ? 'border-brand/30 bg-brand-soft text-brand-ink' : 'border-line'
          }`}
        >
          {KIND_LABEL[item.kind]}
        </span>
        {isTop && <span className="chip border-accent bg-accent text-ink">ТОП</span>}
        {isUrgent && <span className="chip border-danger/30 bg-danger-soft text-danger">Срочно</span>}
      </div>

      <h3 className="font-display text-base font-semibold leading-snug transition group-hover:text-brand">
        {item.title}
      </h3>

      <div className="price-rail mt-4">
        <p className="font-display text-xl font-bold">{tenge(item.price)}</p>
        <p className="text-xs text-muted">в месяц</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted">
        {item.district && <span>{item.district.name}</span>}
        {item.metro && <span>· м. {item.metro}</span>}
        <span>· {item.rooms}-комн.</span>
        <span>· {HOUSING_LABEL[item.housingType]}</span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-ink">
            {initials}
          </span>
          <div className="text-xs">
            <p className="font-medium text-ink">
              {item.author.name}
              {age ? `, ${age}` : ''}
            </p>
            <p className="text-muted">{item.author.occupation ? OCCUPATION_LABEL[item.author.occupation] : '—'}</p>
          </div>
        </div>
        <span className="text-xs text-muted">{timeAgo(item.bumpedAt)}</span>
      </div>
    </Link>
  );
}
