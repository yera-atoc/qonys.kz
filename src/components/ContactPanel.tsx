'use client';

import { useState } from 'react';
import Link from 'next/link';
import { tenge } from '@/lib/format';
import { useI18n } from './I18nProvider';

export function ContactPanel({
  listingId, unlocked, phone, price, signedIn
}: { listingId: string; unlocked: boolean; phone: string | null; price: number; signedIn: boolean }) {
  const { t } = useI18n();
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
      setState({ phone: null, loading: false, error: data.error ?? t.common.error });
      return;
    }
    setState({ phone: data.phone, loading: false, error: null });
  }

  // Для анонима точкой входа служит MessageAuthorButton выше — второй
  // кнопки «Войти» в одной колонке быть не должно
  if (!signedIn) return null;

  if (unlocked || state.phone) {
    return (
      <div className="mt-4 space-y-2.5">
        <a href={`tel:${state.phone}`} className="btn-primary w-full">{state.phone}</a>
        <a
          href={`https://wa.me/${(state.phone ?? '').replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost w-full"
        >
          WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <button onClick={unlock} disabled={state.loading} className="btn-primary w-full">
        {state.loading ? t.common.loading : `${t.listing.showContacts} · ${tenge(price)}`}
      </button>
      <p className="text-center text-[13px] text-muted">{t.listing.contactsHint}</p>
      {state.error === 'INSUFFICIENT_FUNDS' ? (
        <Link href="/cabinet/billing" className="btn-ghost w-full">{t.listing.topUp}</Link>
      ) : (
        state.error && <p className="text-center text-[13px] text-danger">{state.error}</p>
      )}
    </div>
  );
}
