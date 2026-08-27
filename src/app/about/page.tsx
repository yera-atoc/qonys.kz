import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = { title: 'О сервисе' };

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container-q py-14">
        <p className="eyebrow">О сервисе</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight">
          Аренда комнаты в Алматы обычно живёт в чатах. Мы вытащили её оттуда.
        </h1>
        <div className="mt-8 max-w-2xl space-y-4 text-muted">
          <p>
            Qonys — двусторонняя площадка: здесь одинаково удобно и тем, кто сдаёт свободную комнату, и тем, кто ищет
            соседа в уже снятую квартиру. Анкета одна, лента общая, фильтры работают в обе стороны.
          </p>
          <p>
            Мы показываем то, что решает в подселении: район и метро, бюджет, тип жилья, возраст и занятость человека,
            привычки. Контакты открываются только по обоюдному согласию — номер не утекает в спам-рассылки.
          </p>
          <p>
            Сейчас работаем в Алматы по восьми районам. Астана и Шымкент — следующие. Пишите на{' '}
            <a href="mailto:hi@qonys.kz" className="text-brand hover:underline">
              hi@qonys.kz
            </a>
            , если хотите запустить свой город раньше.
          </p>
        </div>
        <Link href="/post" className="btn-primary mt-10">
          Разместить объявление
        </Link>
      </main>
      <Footer />
    </>
  );
}
