'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function UserActions({ id, blocked, role }: { id: string; blocked: boolean; role: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setBusy(false);
    router.refresh();
  }

  async function adjust() {
    const raw = prompt('Начислить или списать (в тенге, минус для списания):', '1000');
    if (!raw) return;
    await post({ adjustBalance: Number(raw) });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button onClick={adjust} disabled={busy} className="btn-ghost px-2.5 py-1 text-xs">
        Баланс
      </button>
      <button
        onClick={() => post({ role: role === 'MODERATOR' ? 'USER' : 'MODERATOR' })}
        disabled={busy}
        className="btn-ghost px-2.5 py-1 text-xs"
      >
        {role === 'MODERATOR' ? 'Снять модератора' : 'В модераторы'}
      </button>
      <button
        onClick={() => post({ status: blocked ? 'ACTIVE' : 'BLOCKED' })}
        disabled={busy}
        className={`px-2.5 py-1 text-xs ${blocked ? 'btn-ghost' : 'btn-ghost text-danger'}`}
      >
        {blocked ? 'Разблокировать' : 'Заблокировать'}
      </button>
    </div>
  );
}
