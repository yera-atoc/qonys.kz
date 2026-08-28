'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ComplaintActions({ id, listingId }: { id: string; listingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function resolve(action: 'block' | 'decline') {
    setBusy(true);
    await fetch('/api/admin/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, listingId, action })
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => resolve('block')} disabled={busy} className="btn-danger text-xs">
        Снять объявление
      </button>
      <button onClick={() => resolve('decline')} disabled={busy} className="btn-ghost text-xs">
        Жалоба необоснованна
      </button>
    </div>
  );
}
