import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = { title: 'Безопасность' };

const RULES = [
  ['Смотрите жильё лично', 'Никаких переводов до просмотра. Если «хозяин в другом городе и просит задаток» — это схема.'],
  ['Проверяйте документы', 'Договор аренды или удостоверение собственника. Попросите показать оригинал при встрече.'],
  ['Знакомьтесь с соседями', 'Подселение — это про людей. Полчаса разговора экономят месяцы конфликтов.'],
  ['Фиксируйте договорённости', 'Кто платит коммуналку, до скольки гости, как делится уборка. Лучше письменно.'],
  ['Жалуйтесь на подозрительное', 'Кнопка «Пожаловаться» есть в каждом объявлении. Модератор смотрит в течение суток.']
];

export default function SafetyPage() {
  return (
    <>
      <Header />
      <main className="container-q py-14">
        <p className="eyebrow">Безопасность</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight">
          Пять проверок перед тем, как отдать деньги
        </h1>
        <div className="mt-10 max-w-2xl divide-y divide-line border-y border-line">
          {RULES.map(([title, text], i) => (
            <div key={title} className="flex gap-5 py-6">
              <span className="font-display text-sm font-bold text-brand">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="font-display text-lg font-semibold">{title}</h2>
                <p className="mt-1.5 text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm text-muted">
          Qonys не участвует в расчётах между жильцами и не является стороной договора аренды. Мы проверяем объявления
          на модерации и блокируем аккаунты за обман, но окончательное решение всегда за вами.
        </p>
      </main>
      <Footer />
    </>
  );
}
