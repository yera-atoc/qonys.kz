'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { tenge, PROMO_LABEL } from '@/lib/format';

type Pack = { id: string; type: string; title: string; days: number; price: number };

export function PromoPicker({ listingId, packages }: { listingId: string; packages: Pack[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function buy(pack: Pack) {
    setPending(pack.id);
    setError(null);
    const res = await fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, packageId: pack.id })
    });
    const data = await res.json();
    setPending(null);
    if (!res.ok) {
      setError(data.error === 'INSUFFICIENT_FUNDS' ? 'INSUFFICIENT_FUNDS' : data.error ?? 'Не удалось купить');
      return;
    }
    setDone(pack.title);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {done && (
        <div className="rounded-xl border border-brand/30 bg-brand-soft px-4 py-3 text-sm text-brand-ink">
          Подключено: {done}. Объявление уже поднялось в ленте.
        </div>
      )}

      {error === 'INSUFFICIENT_FUNDS' ? (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          На балансе не хватает средств.{' '}
          <Link href="/cabinet/billing" className="underline">
            Пополнить
          </Link>
        </div>
      ) : (
        error && <p className="text-sm text-danger">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <div key={p.id} className="card-q flex flex-col p-5">
            <span className="chip w-fit border-brand/30 bg-brand-soft text-brand-ink">{PROMO_LABEL[p.type] ?? p.type}</span>
            <h3 className="mt-3 font-display font-semibold">{p.title}</h3>
            <p className="mt-auto pt-4 font-display text-xl font-bold">{tenge(p.price)}</p>
            <button onClick={() => buy(p)} disabled={pending === p.id} className="btn-primary mt-3">
              {pending === p.id ? 'Списываем…' : 'Подключить'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
