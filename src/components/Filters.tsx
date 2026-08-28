'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { tenge } from '@/lib/format';
import { KZ_CITIES_BY_REGION } from '@/lib/kzCities';

type Props = { districts: { id: string; name: string }[]; city: string };

const KINDS = [
  { value: '', label: 'Все' },
  { value: 'OFFER_ROOM', label: 'Сдают комнату' },
  { value: 'SEEK_ROOMMATE', label: 'Ищут соседа' }
];

export function Filters({ districts, city }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [budget, setBudget] = useState(Number(params.get('maxPrice') ?? 200000));

  function apply(patch: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    startTransition(() => router.replace(`/?${next.toString()}#feed`, { scroll: false }));
  }

  const kind = params.get('kind') ?? '';

  return (
    <div className={`transition-opacity ${pending ? 'opacity-50' : ''}`}>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.value}
            onClick={() => apply({ kind: k.value })}
            disabled={pending}
            className={`rounded-full px-5 py-2.5 text-[15px] font-medium transition ${
              kind === k.value
                ? 'bg-ink text-white'
                : 'border border-line bg-white text-muted shadow-pill hover:text-ink'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label" htmlFor="f-city">Город</label>
          <select
            id="f-city"
            className="field"
            disabled={pending}
            value={city}
            onChange={(e) => apply({ city: e.target.value, district: '' })}
          >
            {Object.entries(KZ_CITIES_BY_REGION).map(([region, cities]) => (
              <optgroup key={region} label={region}>
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-district">Район</label>
          <select
            id="f-district"
            className="field"
            disabled={pending}
            defaultValue={params.get('district') ?? ''}
            onChange={(e) => apply({ district: e.target.value })}
          >
            <option value="">Любой район</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-type">Тип жилья</label>
          <select
            id="f-type"
            className="field"
            disabled={pending}
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
          <label className="label" htmlFor="f-gender">Пол соседа</label>
          <select
            id="f-gender"
            className="field"
            disabled={pending}
            defaultValue={params.get('gender') ?? ''}
            onChange={(e) => apply({ gender: e.target.value })}
          >
            <option value="">Любой</option>
            <option value="FEMALE">Женский</option>
            <option value="MALE">Мужской</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-budget">Бюджет до {tenge(budget)}</label>
          <input
            id="f-budget"
            type="range"
            min={20000}
            max={400000}
            step={5000}
            value={budget}
            disabled={pending}
            onChange={(e) => setBudget(Number(e.target.value))}
            onMouseUp={() => apply({ maxPrice: String(budget) })}
            onTouchEnd={() => apply({ maxPrice: String(budget) })}
            className="mt-3.5 w-full accent-ink"
          />
        </div>
      </div>
    </div>
  );
}
