'use client';

import { useState } from 'react';

const REASONS = [
  'Мошенничество или предоплата',
  'Объявление неактуально',
  'Фото не соответствуют жилью',
  'Оскорбления или дискриминация',
  'Дубликат'
];

export function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  async function send() {
    await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, reason, comment })
    });
    setSent(true);
    setOpen(false);
  }

  if (sent) return <p className="text-xs text-muted">Жалоба отправлена, модератор посмотрит в течение суток.</p>;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-muted underline hover:text-danger">
        Пожаловаться на объявление
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <select className="field" value={reason} onChange={(e) => setReason(e.target.value)}>
        {REASONS.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <textarea
        className="field min-h-[70px]"
        placeholder="Что не так? Пара деталей поможет модератору."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={send} className="btn-danger flex-1 text-xs">
          Отправить
        </button>
        <button onClick={() => setOpen(false)} className="btn-ghost text-xs">
          Отмена
        </button>
      </div>
    </div>
  );
}
