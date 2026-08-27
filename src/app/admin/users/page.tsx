import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { UserActions } from '@/components/admin/UserActions';
import { tenge, timeAgo } from '@/lib/format';

export const metadata = { title: 'Пользователи' };
export const dynamic = 'force-dynamic';

const ROLE_LABEL: Record<string, string> = {
  USER: 'Пользователь',
  AGENT: 'Риелтор',
  MODERATOR: 'Модератор',
  ADMIN: 'Админ'
};

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const me = await requireStaff();

  const users = await prisma.user.findMany({
    where: searchParams.q
      ? {
          OR: [
            { name: { contains: searchParams.q, mode: 'insensitive' } },
            { phone: { contains: searchParams.q } }
          ]
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      wallet: true,
      _count: { select: { listings: true } },
      subscriptions: { where: { status: 'ACTIVE', endsAt: { gt: new Date() } }, include: { plan: true }, take: 1 }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Пользователи</h1>
        <form action="/admin/users">
          <input name="q" defaultValue={searchParams.q} className="field w-64" placeholder="Имя или телефон" />
        </form>
      </div>

      <div className="card-q overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="p-4">Пользователь</th>
              <th className="p-4">Роль</th>
              <th className="p-4">Тариф</th>
              <th className="p-4">Баланс</th>
              <th className="p-4">Объявлений</th>
              <th className="p-4">Регистрация</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className={u.status === 'BLOCKED' ? 'bg-danger-soft/40' : ''}>
                <td className="p-4">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted">{u.phone}</p>
                </td>
                <td className="p-4">
                  <span className="chip">{ROLE_LABEL[u.role]}</span>
                </td>
                <td className="p-4 text-xs text-muted">{u.subscriptions[0]?.plan.title ?? '—'}</td>
                <td className="p-4 tabular-nums">{tenge((u.wallet?.balance ?? 0) + (u.wallet?.bonusBalance ?? 0))}</td>
                <td className="p-4 tabular-nums">{u._count.listings}</td>
                <td className="p-4 text-xs text-muted">{timeAgo(u.createdAt)}</td>
                <td className="p-4">
                  {me.role === 'ADMIN' && u.role !== 'ADMIN' && (
                    <UserActions id={u.id} blocked={u.status === 'BLOCKED'} role={u.role} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
