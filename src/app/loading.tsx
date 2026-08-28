import { ListingCardSkeleton } from '@/components/ListingCard';

export default function Loading() {
  return (
    <div className="container-q py-14">
      <div className="mb-8 space-y-3">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-4 w-64" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
