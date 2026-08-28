'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { tenge } from '@/lib/format';

type Props = { districts: { id: string; name: string }[] };

const KINDS = [
  { value: '', label: 'Все' },
  { value: 'OFFER_ROOM', label: 'Сдают комнату' },
  { value: 'SEEK_ROOMMATE', label: 'Ищут соседа' }
];

export function Filters({ districts }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [budget, setBudget] = useState(Number(params.get('maxPrice') ?? 200000));

  function apply(patch: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`/?${next.toString()}#feed`, { scroll: false });
  }

  const kind = params.get('kind') ?? '';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.value}
            onClick={() => apply({ kind: k.value })}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              kind === k.value ? 'bg-ink text-white' : 'border border-line bg-card text-muted hover:text-ink'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Район</label>
          <select
            className="field"
            defaultValue={params.get('district') ?? ''}
            onChange={(e) => apply({ district: e.target.value })}
          >
            <option value="">Любой район</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Тип жилья</label>
          <select
            className="field"
            defaultValue={params.get('housingType') ?? ''}
            onChange={(e) => apply({ housingType: e.target.value })}
          >
            <option value="">Любой</option>
            <option value="SEPARATE_ROOM">Отдельная комната</option>
            <option value="SHARED_ROOM">Делить комнату</option>
            <option value="BED_SPACE">Койко-место</option>
          </select>
        </div>

        <div>
          <label className="label">Пол соседа</label>
          <select
            className="field"
            defaultValue={params.get('gender') ?? ''}
            onChange={(e) => apply({ gender: e.target.value })}
          >
            <option value="">Любой</option>
            <option value="FEMALE">Женский</option>
            <option value="MALE">Мужской</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Бюджет до {tenge(budget)}</label>
        <input
          type="range"
          min={20000}
          max={400000}
          step={5000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          onMouseUp={() => apply({ maxPrice: String(budget) })}
          onTouchEnd={() => apply({ maxPrice: String(budget) })}
          className="w-full accent-brand"
        />
      </div>
    </div>
  );
}
