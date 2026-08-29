'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SupportActions({
  threadId,
  status,
  assigneeId,
  meId
}: {
  threadId: string;
  status: string;
  assigneeId: string | null;
  meId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: 'assign' | 'close' | 'reopen') {
    setBusy(true);
    await fetch(`/api/threads/${threadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="card-q space-y-2 p-4">
      <p className="mb-1 text-xs uppercase tracking-wide text-muted">Обращение</p>

      {assigneeId !== meId && (
        <button onClick={() => void run('assign')} disabled={busy} className="btn-ghost btn-sm w-full">
          Взять в работу
        </button>
      )}

      {status === 'CLOSED' ? (
        <button onClick={() => void run('reopen')} disabled={busy} className="btn-ghost btn-sm w-full">
          Открыть заново
        </button>
      ) : (
        <button onClick={() => void run('close')} disabled={busy} className="btn-primary btn-sm w-full">
          Закрыть обращение
        </button>
      )}
    </div>
  );
}
