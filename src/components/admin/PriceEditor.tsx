'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tenge, PROMO_LABEL } from '@/lib/format';

type Plan = { id: string; title: string; price: number; listingLimit: number; isActive: boolean };
type Pack = { id: string; title: string; price: number; days: number; type: string; isActive: boolean };

export function PriceEditor({ plans, packages }: { plans: Plan[]; packages: Pack[] }) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Тарифы риелторов</h2>
        <div className="card-q divide-y divide-line">
          {plans.map((p) => (
            <Row
              key={p.id}
              kind="plan"
              id={p.id}
              title={p.title}
              subtitle={`До ${p.listingLimit} объявлений`}
              price={p.price}
              isActive={p.isActive}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Пакеты продвижения</h2>
        <div className="card-q divide-y divide-line">
          {packages.map((p) => (
            <Row
              key={p.id}
              kind="package"
              id={p.id}
              title={p.title}
              subtitle={`${PROMO_LABEL[p.type] ?? p.type} · ${p.days} дн.`}
              price={p.price}
              isActive={p.isActive}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({
  kind, id, title, subtitle, price, isActive
}: { kind: 'plan' | 'package'; id: string; title: string; subtitle: string; price: number; isActive: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(price);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(patch: Record<string, unknown>) {
    setBusy(true);
    setSaved(false);
    await fetch('/api/admin/tariffs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, id, ...patch })
    });
    setBusy(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="field w-32 text-right tabular-nums"
        />
        <span className="text-xs text-muted">₸</span>
        <button onClick={() => save({ price: value })} disabled={busy || value === price} className="btn-primary text-xs">
          Сохранить
        </button>
        <button onClick={() => save({ isActive: !isActive })} disabled={busy} className="btn-ghost text-xs">
          {isActive ? 'Скрыть' : 'Показать'}
        </button>
        {saved && <span className="text-xs text-brand">Сохранено · {tenge(value)}</span>}
      </div>
    </div>
  );
}
