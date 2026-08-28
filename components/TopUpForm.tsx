'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tenge } from '@/lib/format';

const PRESETS = [2000, 5000, 10000, 25000];

export function TopUpForm() {
  const router = useRouter();
  const [amount, setAmount] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Не удалось создать платёж');
      return;
    }
    if (data.redirectUrl?.startsWith('http')) {
      window.location.href = data.redirectUrl;
    } else {
      router.refresh();
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((v) => (
          <button
            key={v}
            onClick={() => setAmount(v)}
            className={`rounded-xl border px-3 py-2 text-sm transition ${
              amount === v ? 'border-brand bg-brand-soft text-brand-ink' : 'border-line text-muted hover:text-ink'
            }`}
          >
            {tenge(v)}
          </button>
        ))}
      </div>

      <input
        type="number"
        min={500}
        step={500}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="field"
        aria-label="Своя сумма"
      />

      {error && <p className="text-xs text-danger">{error}</p>}

      <button onClick={submit} disabled={loading} className="btn-primary w-full">
        {loading ? 'Открываем оплату…' : `Пополнить на ${tenge(amount)}`}
      </button>
      <p className="text-xs text-muted">Kaspi, карты Visa и Mastercard. Чек придёт на телефон.</p>
    </div>
  );
}
