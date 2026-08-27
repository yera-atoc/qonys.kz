import { Suspense } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { LoginForm } from '@/components/LoginForm';

export const metadata = { title: 'Вход' };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="card-q p-6">
          <h1 className="font-display text-xl font-bold">Вход в кабинет</h1>
          <p className="mt-1 text-sm text-muted">Номер телефона и пароль, которые вы указали при регистрации.</p>
          <Suspense fallback={<div className="mt-6 h-48" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-brand hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </main>
  );
}
