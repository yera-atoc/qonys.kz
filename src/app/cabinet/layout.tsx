import { redirect } from 'next/navigation';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/Header';
import { tenge } from '@/lib/format';

const NAV = [
  { href: '/cabinet', label: 'Обзор' },
  { href: '/cabinet/listings', label: 'Мои объявления' },
  { href: '/cabinet/billing', label: 'Баланс и платежи' },
  { href: '/cabinet/plans', label: 'Тариф' },
  { href: '/cabinet/profile', label: 'Профиль' }
];

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const me = await currentUser();
  if (!me) redirect('/login?callbackUrl=/cabinet');

  const wallet = await prisma.wallet.upsert({
    where: { userId: me.id },
    update: {},
    create: { userId: me.id }
  });

  return (
    <>
      <Header />
      <div className="container-q grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-q mb-4 p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Баланс</p>
            <p className="mt-1 font-display text-xl font-bold">{tenge(wallet.balance + wallet.bonusBalance)}</p>
            {wallet.bonusBalance > 0 && (
              <p className="text-xs text-muted">включая бонусы {tenge(wallet.bonusBalance)}</p>
            )}
            <Link href="/cabinet/billing" className="btn-primary mt-3 w-full text-xs">
              Пополнить
            </Link>
          </div>

          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-card hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </>
  );
}
