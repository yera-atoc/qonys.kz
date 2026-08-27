import { redirect } from 'next/navigation';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Logo } from '@/components/Logo';

const NAV = [
  { href: '/admin', label: 'Дашборд' },
  { href: '/admin/moderation', label: 'Модерация' },
  { href: '/admin/listings', label: 'Объявления' },
  { href: '/admin/users', label: 'Пользователи' },
  { href: '/admin/payments', label: 'Платежи' },
  { href: '/admin/tariffs', label: 'Тарифы и пакеты' },
  { href: '/admin/complaints', label: 'Жалобы' },
  { href: '/admin/settings', label: 'Настройки' }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await currentUser();
  if (!me) redirect('/login?callbackUrl=/admin');
  if (me.role !== 'ADMIN' && me.role !== 'MODERATOR') redirect('/cabinet');

  const [moderationCount, complaintCount] = await Promise.all([
    prisma.listing.count({ where: { status: 'MODERATION' } }),
    prisma.complaint.count({ where: { status: 'NEW' } })
  ]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-ink text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand font-display text-sm font-bold">Q</span>
            <span className="font-display text-sm font-semibold">Админка</span>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
              {item.href === '/admin/moderation' && moderationCount > 0 && (
                <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-ink">
                  {moderationCount}
                </span>
              )}
              {item.href === '/admin/complaints' && complaintCount > 0 && (
                <span className="ml-2 rounded-full bg-danger px-2 py-0.5 text-[11px] font-semibold text-white">
                  {complaintCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden px-5 py-4 text-xs text-white/50 lg:block">
          <Link href="/" className="hover:text-white">← На сайт</Link>
        </div>
      </aside>

      <main className="bg-paper px-5 py-8 lg:px-10">{children}</main>
    </div>
  );
}
