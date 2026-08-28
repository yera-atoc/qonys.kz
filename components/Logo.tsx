import Link from 'next/link';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand font-display text-sm font-bold text-white">
        Q
      </span>
      {!compact && <span className="font-display text-lg font-semibold tracking-tight">Qonys</span>}
    </Link>
  );
}
