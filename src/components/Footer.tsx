import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="container-q flex flex-wrap items-center justify-between gap-6 py-10">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-display text-sm font-bold text-white">
            Q
          </span>
          <span className="text-[15px] text-muted">
            <span className="font-display font-bold text-ink">Qonys</span> · подселение в Алматы
          </span>
        </div>

        <nav className="flex flex-wrap gap-6 text-[15px] text-muted">
          <Link href="/pricing" className="hover:text-ink">Тарифы</Link>
          <Link href="/safety" className="hover:text-ink">Безопасность</Link>
          <Link href="/rules" className="hover:text-ink">Правила</Link>
          <Link href="/about" className="hover:text-ink">О сервисе</Link>
        </nav>

        <div className="flex items-center gap-6 text-[15px] text-muted">
          <a href="mailto:hi@qonys.kz" className="hover:text-ink">hi@qonys.kz</a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
