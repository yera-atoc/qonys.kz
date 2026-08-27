'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ListingRowActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(action: string) {
    setBusy(true);
    await fetch(`/api/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm('Удалить объявление? Это действие необратимо.')) return;
    setBusy(true);
    await fetch(`/api/listings/${id}`, { method: 'DELETE' });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/cabinet/promote/${id}`} className="btn-accent text-xs">
        Продвинуть
      </Link>
      {status === 'ACTIVE' && (
        <button onClick={() => patch('bump')} disabled={busy} className="btn-ghost text-xs">
          Поднять
        </button>
      )}
      {status === 'ACTIVE' ? (
        <button onClick={() => patch('archive')} disabled={busy} className="btn-ghost text-xs">
          В архив
        </button>
      ) : (
        <button onClick={() => patch('republish')} disabled={busy} className="btn-ghost text-xs">
          Опубликовать
        </button>
      )}
      <button onClick={remove} disabled={busy} className="btn-ghost text-xs text-danger">
        Удалить
      </button>
    </div>
  );
}
