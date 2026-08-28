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

  if (sent) return <p className="text-[13px] text-muted">Жалоба отправлена, модератор посмотрит в течение суток.</p>;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[13px] text-muted underline underline-offset-2 hover:text-danger">
        Пожаловаться на объявление
      </button>
    );
  }

  return (
    <div className="space-y-2.5">
      <select className="field" value={reason} onChange={(e) => setReason(e.target.value)}>
        {REASONS.map((r) => (<option key={r}>{r}</option>))}
      </select>
      <textarea
        className="field min-h-[80px]"
        placeholder="Что не так? Пара деталей поможет модератору."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={send} className="btn-danger btn-sm flex-1">Отправить</button>
        <button onClick={() => setOpen(false)} className="btn-ghost btn-sm">Отмена</button>
      </div>
    </div>
  );
}
