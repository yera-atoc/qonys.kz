'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get('name')),
      phone: String(form.get('phone')),
      password: String(form.get('password'))
    };

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? 'Не получилось зарегистрироваться');
      return;
    }

    await signIn('credentials', { phone: payload.phone, password: payload.password, redirect: false });
    router.push('/cabinet');
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card-q p-6">
          <h1 className="font-display text-xl font-bold">Регистрация</h1>
          <p className="mt-1 text-sm text-muted">Займёт минуту. Первые два объявления — бесплатно.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">
                Как вас зовут
              </label>
              <input id="name" name="name" className="field" placeholder="Айгерим" required />
            </div>
            <div>
              <label className="label" htmlFor="phone">
                Телефон
              </label>
              <input id="phone" name="phone" className="field" placeholder="+7 700 000 00 00" required />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Пароль
              </label>
              <input id="password" name="password" type="password" className="field" minLength={8} required />
              <p className="mt-1 text-xs text-muted">Минимум 8 символов</p>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Создаём аккаунт…' : 'Создать аккаунт'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-brand hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </main>
  );
}
