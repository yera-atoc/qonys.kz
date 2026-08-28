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
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-subtle px-6 py-20 text-center">
      <h3 className="font-display text-[22px] font-bold tracking-tight">{title}</h3>
      <p className="max-w-md text-[15px] text-muted">{hint}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-2">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
