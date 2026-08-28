import Link from 'next/link';

export function Logo({ city = 'Алматы' }: { city?: string | null }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 100 100"
        className="h-9 w-9 shrink-0"
        role="img"
        aria-label="Qonys"
      >
        <rect x="0" y="0" width="100" height="100" rx="22" fill="#0B0B0B" />
        <path
          d="M 35 60 L 52 38 L 69 60"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.32"
        />
        <path
          d="M 31 56 L 48 34 L 65 56"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-[19px] font-bold tracking-tight">Qonys</span>
      {city && <span className="hidden text-[15px] text-muted sm:block">{city}</span>}
    </Link>
  );
}
