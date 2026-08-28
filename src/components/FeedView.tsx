'use client';

import { useState } from 'react';
import { ListingCard, type ListingCardData } from '@/components/ListingCard';
import { EmptyState } from '@/components/EmptyState';
import { ListingsMap, type MapListing } from '@/components/ListingsMap';

export function FeedView({
  cards,
  mapListings,
  citySlug
}: {
  cards: ListingCardData[];
  mapListings: MapListing[];
  citySlug: string;
}) {
  const [view, setView] = useState<'list' | 'map'>('list');

  return (
    <div>
      <div className="flex items-center gap-2">
        {(['list', 'map'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-5 py-2.5 text-[15px] font-medium transition ${
              view === v ? 'bg-ink text-white' : 'border border-line bg-white text-muted shadow-pill hover:text-ink'
            }`}
          >
            {v === 'list' ? 'Списком' : 'На карте'}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {view === 'map' ? (
          <ListingsMap listings={mapListings} citySlug={citySlug} />
        ) : cards.length === 0 ? (
          <EmptyState
            title="Под эти фильтры пока ничего нет"
            hint="Расширьте бюджет, смените город или уберите район."
            actionHref="/"
            actionLabel="Сбросить фильтры"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
