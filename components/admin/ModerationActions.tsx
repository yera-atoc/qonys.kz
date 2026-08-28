'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const REASONS = [
  'Фото не соответствуют описанию',
  'Подозрение на мошенничество',
  'Дубликат существующего объявления',
  'Контакты в тексте объявления',
  'Цена не соответствует рынку'
];

export function ModerationActions({ id }: { id: string }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [busy, setBusy] = useState(false);

  async function send(action: 'approve' | 'reject') {
    setBusy(true);
    await fetch('/api/admin/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, reason: action === 'reject' ? reason : undefined })
    });
    setBusy(false);
    setRejecting(false);
    router.refresh();
  }

  if (rejecting) {
    return (
      <div className="w-full max-w-xs space-y-2">
        <select className="field" value={reason} onChange={(e) => setReason(e.target.value)}>
          {REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <input
          className="field"
          placeholder="Или своя причина"
          onChange={(e) => e.target.value && setReason(e.target.value)}
        />
        <div className="flex gap-2">
          <button onClick={() => send('reject')} disabled={busy} className="btn-danger flex-1 text-xs">
            Отклонить
          </button>
          <button onClick={() => setRejecting(false)} className="btn-ghost text-xs">
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => send('approve')} disabled={busy} className="btn-primary text-xs">
        Опубликовать
      </button>
      <button onClick={() => setRejecting(true)} className="btn-ghost text-xs text-danger">
        Отклонить
      </button>
    </div>
  );
}
