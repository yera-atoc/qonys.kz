import Link from 'next/link';

export function Logo({ city = 'Алматы' }: { city?: string | null }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink font-display text-[15px] font-bold text-white">
        Q
      </span>
      <span className="font-display text-[19px] font-bold tracking-tight">Qonys</span>
      {city && <span className="hidden text-[15px] text-muted sm:block">{city}</span>}
    </Link>
  );
}
