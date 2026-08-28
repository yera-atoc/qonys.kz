import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-card">
      <div className="container-q grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Подселение и поиск соседей в Казахстане. Алматы — сейчас, Астана и Шымкент — скоро.
          </p>
        </div>
        <FooterCol
          title="Площадка"
          links={[
            ['/', 'Лента объявлений'],
            ['/post', 'Разместить объявление'],
            ['/pricing', 'Тарифы и продвижение']
          ]}
        />
        <FooterCol
          title="Помощь"
          links={[
            ['/safety', 'Безопасность сделок'],
            ['/about', 'О сервисе'],
            ['/rules', 'Правила размещения']
          ]}
        />
        <div>
          <h4 className="label">Связаться</h4>
          <a href="mailto:hi@qonys.kz" className="text-sm text-ink hover:text-brand">
            hi@qonys.kz
          </a>
          <p className="mt-4 text-xs text-muted">© {new Date().getFullYear()} Qonys.kz</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="label">{title}</h4>
      <ul className="space-y-2 text-sm text-muted">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
