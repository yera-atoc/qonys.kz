'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      phone: String(form.get('phone')),
      password: String(form.get('password')),
      redirect: false
    });

    setLoading(false);
    if (res?.error) {
      setError('Неверный номер или пароль');
      return;
    }

    router.push(params.get('callbackUrl') ?? '/cabinet');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label className="label" htmlFor="phone">Телефон</label>
        <input id="phone" name="phone" className="field" placeholder="+7 700 000 00 00" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Пароль</label>
        <input id="password" name="password" type="password" className="field" required />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? 'Проверяем…' : 'Войти'}
      </button>
    </form>
  );
}
