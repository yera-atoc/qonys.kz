'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
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
  const [pending, startTransition] = useTransition();
  const [budget, setBudget] = useState(Number(params.get('maxPrice') ?? 200000));
  const [open, setOpen] = useState(false);

  function apply(patch: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    // startTransition даёт мгновенную обратную связь: кнопка гаснет, лента тускнеет
    startTransition(() => router.replace(`/?${next.toString()}#feed`, { scroll: false }));
  }

  const kind = params.get('kind') ?? '';
  const activeCount = ['district', 'housingType', 'gender', 'maxPrice'].filter((k) => params.get(k)).length;

  return (
    <div className={`transition-opacity ${pending ? 'opacity-60' : ''}`}>
      {/* Верхняя строка: тип + переключатель фильтров */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-line bg-card p-1">
          {KINDS.map((k) => (
            <button
              key={k.value}
              onClick={() => apply({ kind: k.value })}
              disabled={pending}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                kind === k.value ? 'bg-ink text-white' : 'text-muted hover:text-ink'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={`btn-ghost ml-auto ${open ? 'border-brand text-brand' : ''}`}
          aria-expanded={open}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 6h14M6 10h8M8.5 14h3" strokeLinecap="round" />
          </svg>
          Фильтры
          {activeCount > 0 && (
            <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button onClick={() => startTransition(() => router.replace('/#feed'))} className="text-sm text-muted hover:text-danger">
            Сбросить
          </button>
        )}
      </div>

      {/* Разворачиваемая панель */}
      {open && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-line bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
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
              className="mt-3 w-full accent-brand"
            />
          </div>
        </div>
      )}
    </div>
  );
}
