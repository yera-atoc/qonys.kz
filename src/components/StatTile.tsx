export function StatTile({
  value,
  label,
  hint,
  tone = 'default'
}: {
  value: string | number;
  label: string;
  hint?: string;
  tone?: 'default' | 'brand' | 'accent';
}) {
  const toneClass =
    tone === 'brand' ? 'bg-brand-soft border-brand/20' : tone === 'accent' ? 'bg-accent-soft border-accent/30' : 'bg-card';
  return (
    <div className={`rounded-2xl border border-line p-5 ${toneClass}`}>
      <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-medium text-ink">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
