import { ListingCardSkeleton } from '@/components/ListingCard';

export default function Loading() {
  return (
    <div className="container-q py-16">
      <div className="space-y-4">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-4 w-64" />
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
