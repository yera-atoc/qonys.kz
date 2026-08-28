'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type U = {
  name: string; phone: string; email: string | null;
  birthYear: number | null; gender: string | null;
  occupation: string | null; about: string | null;
};

export function ProfileForm({ user }: { user: U }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(fd.entries()))
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Имя</label>
          <input id="name" name="name" className="field" defaultValue={user.name} required />
        </div>
        <div>
          <label className="label" htmlFor="phone">Телефон</label>
          <input id="phone" className="field bg-paper" defaultValue={user.phone} disabled />
          <p className="mt-1 text-xs text-muted">Чтобы сменить номер, напишите в поддержку</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="birthYear">Год рождения</label>
          <input id="birthYear" name="birthYear" type="number" className="field" min={1940} max={2010} defaultValue={user.birthYear ?? ''} />
        </div>
        <div>
          <label className="label" htmlFor="gender">Пол</label>
          <select id="gender" name="gender" className="field" defaultValue={user.gender ?? ''}>
            <option value="">Не указан</option>
            <option value="FEMALE">Женский</option>
            <option value="MALE">Мужской</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="occupation">Занятость</label>
          <select id="occupation" name="occupation" className="field" defaultValue={user.occupation ?? ''}>
            <option value="">Не указана</option>
            <option value="STUDENT">Студент(ка)</option>
            <option value="WORKING">Работает</option>
            <option value="REMOTE">Удалёнка</option>
            <option value="OTHER">Другое</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="email">Почта для чеков</label>
        <input id="email" name="email" type="email" className="field" defaultValue={user.email ?? ''} />
      </div>

      <div>
        <label className="label" htmlFor="about">О себе</label>
        <textarea id="about" name="about" className="field min-h-[100px]" defaultValue={user.about ?? ''}
          placeholder="Режим дня, привычки, чем занимаетесь. Это читают будущие соседи." />
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <button className="btn-primary" disabled={loading}>{loading ? 'Сохраняем…' : 'Сохранить'}</button>
        {saved && <span className="text-sm text-brand">Изменения сохранены</span>}
      </div>
    </form>
  );
}
