'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SettingsForm({
  fields,
  values
}: {
  fields: { key: string; label: string; hint: string }[];
  values: Record<string, string>;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(fd.entries()))
    });
    setBusy(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="label" htmlFor={f.key}>
            {f.label}
          </label>
          <input id={f.key} name={f.key} className="field" defaultValue={values[f.key] ?? ''} />
          <p className="mt-1 text-xs text-muted">{f.hint}</p>
        </div>
      ))}
      <div className="flex items-center gap-3 border-t border-line pt-5">
        <button className="btn-primary" disabled={busy}>
          {busy ? 'Сохраняем…' : 'Сохранить настройки'}
        </button>
        {saved && <span className="text-sm text-brand">Сохранено</span>}
      </div>
    </form>
  );
}
