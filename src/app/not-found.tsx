import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="eyebrow">Страница 404</p>
        <h1 className="mt-3 font-display text-3xl font-bold">Такой страницы нет</h1>
        <p className="mt-3 text-muted">Возможно, объявление сняли с публикации или ссылка устарела.</p>
        <Link href="/" className="btn-primary mt-6">
          Вернуться в ленту
        </Link>
      </div>
    </main>
  );
}
