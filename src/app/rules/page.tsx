import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = { title: 'Правила размещения' };

const RULES = [
  ['Одна комната — одно объявление', 'Дубликаты снимаются без предупреждения. Чтобы поднять анкету, используйте кнопку «Поднять» в кабинете.'],
  ['Реальные фото', 'Снимки из интернета и рендеры застройщика — повод для отклонения. Фотографируйте на телефон, как есть.'],
  ['Цена без сюрпризов', 'Указывайте сумму, которую жилец платит ежемесячно. Комиссию и залог выносите в отдельные поля.'],
  ['Без контактов в тексте', 'Номер откроется через кнопку в объявлении. Телефон в описании удаляется модератором.'],
  ['Никакой дискриминации', 'Предпочтения по полу и возрасту допустимы для подселения. Отказ по национальности или языку — нет.']
];

export default function RulesPage() {
  return (
    <>
      <Header />
      <main className="container-q py-14">
        <p className="eyebrow">Правила</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight">Что проверяет модератор</h1>
        <div className="mt-10 max-w-2xl divide-y divide-line border-y border-line">
          {RULES.map(([title, text]) => (
            <div key={title} className="py-6">
              <h2 className="font-display text-lg font-semibold">{title}</h2>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm text-muted">
          Объявление проверяется в течение суток. Если отклонили — причина придёт в кабинет, исправьте и отправьте
          снова.
        </p>
      </main>
      <Footer />
    </>
  );
}
