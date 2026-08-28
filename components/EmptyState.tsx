import Link from 'next/link';

export function EmptyState({
  title,
  hint,
  actionHref,
  actionLabel
}: {
  title: string;
  hint: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card-q flex flex-col items-center gap-3 px-6 py-14 text-center">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{hint}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-2">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
