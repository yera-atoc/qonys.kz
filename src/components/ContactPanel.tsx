'use client';

import { useState } from 'react';
import Link from 'next/link';
import { tenge } from '@/lib/format';

export function ContactPanel({
  listingId, unlocked, phone, price, signedIn
}: { listingId: string; unlocked: boolean; phone: string | null; price: number; signedIn: boolean }) {
  const [state, setState] = useState<{ phone: string | null; error: string | null; loading: boolean }>({
    phone, error: null, loading: false
  });

  async function unlock() {
    setState((s) => ({ ...s, loading: true, error: null }));
    const res = await fetch('/api/contacts/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId })
    });
    const data = await res.json();
    if (!res.ok) {
      setState({ phone: null, loading: false, error: data.error ?? 'Не удалось открыть контакты' });
      return;
    }
    setState({ phone: data.phone, loading: false, error: null });
  }

  if (!signedIn) {
    return (
      <Link href="/login" className="btn-primary mt-6 w-full">
        Войти и написать
      </Link>
    );
  }

  if (unlocked || state.phone) {
    return (
      <div className="mt-6 space-y-2.5">
        <a href={`tel:${state.phone}`} className="btn-primary w-full">{state.phone}</a>
        <a
          href={`https://wa.me/${(state.phone ?? '').replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost w-full"
        >
          Написать в WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <button onClick={unlock} disabled={state.loading} className="btn-primary w-full">
        {state.loading ? 'Открываем…' : `Показать контакты · ${tenge(price)}`}
      </button>
      <p className="text-center text-[13px] text-muted">Списывается с баланса кабинета, один раз на объявление</p>
      {state.error === 'INSUFFICIENT_FUNDS' ? (
        <Link href="/cabinet/billing" className="btn-ghost w-full">Пополнить баланс</Link>
      ) : (
        state.error && <p className="text-center text-[13px] text-danger">{state.error}</p>
      )}
    </div>
  );
}
