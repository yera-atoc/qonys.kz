'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { tenge } from '@/lib/format';

type Plan = {
  id: string; slug: string; title: string; price: number;
  listingLimit: number; freeBumps: number; freeTopDays: number;
  hasAnalytics: boolean; hasBadge: boolean;
};

export function PlanPicker({ plans, currentPlanId }: { plans: Plan[]; currentPlanId: string | null }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(plan: Plan) {
    setPending(plan.id);
    setError(null);
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: plan.id })
    });
    const data = await res.json();
    setPending(null);
    if (!res.ok) {
      setError(data.error === 'INSUFFICIENT_FUNDS' ? 'INSUFFICIENT_FUNDS' : data.error ?? 'Не удалось подключить тариф');
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error === 'INSUFFICIENT_FUNDS' ? (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          Не хватает средств на балансе.{' '}
          <Link href="/cabinet/billing" className="underline">Пополнить</Link>
        </div>
      ) : (
        error && <p className="text-sm text-danger">{error}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card-q flex flex-col p-6 ${plan.id === currentPlanId ? 'border-brand ring-1 ring-brand/20' : ''}`}
          >
            <h3 className="font-display text-lg font-bold">{plan.title}</h3>
            <p className="mt-2 font-display text-3xl font-bold">{tenge(plan.price)}</p>
            <p className="text-xs text-muted">в месяц</p>
            <ul className="mt-5 space-y-1.5 text-sm text-muted">
              <li>До {plan.listingLimit} объявлений</li>
              <li>{plan.freeBumps} поднятий в месяц</li>
              {plan.freeTopDays > 0 && <li>{plan.freeTopDays} дней ТОП</li>}
              {plan.hasAnalytics && <li>Аналитика</li>}
              {plan.hasBadge && <li>Значок «Проверенный риелтор»</li>}
            </ul>
            <button
              onClick={() => subscribe(plan)}
              disabled={pending === plan.id || plan.id === currentPlanId}
              className="btn-primary mt-6"
            >
              {plan.id === currentPlanId ? 'Текущий тариф' : pending === plan.id ? 'Подключаем…' : 'Подключить'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
