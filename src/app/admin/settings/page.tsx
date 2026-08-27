import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const metadata = { title: 'Настройки' };
export const dynamic = 'force-dynamic';

const FIELDS: { key: string; label: string; hint: string }[] = [
  { key: 'contact_unlock_price', label: 'Цена открытия контактов, ₸', hint: 'Списывается один раз за объявление' },
  { key: 'free_listings_per_user', label: 'Бесплатных объявлений на аккаунт', hint: 'Сверх лимита — только по тарифу' },
  { key: 'listing_ttl_days', label: 'Срок жизни объявления, дней', hint: 'После этого объявление уходит в архив' },
  { key: 'moderation_auto_approve', label: 'Автопубликация без модерации', hint: 'true или false' },
  { key: 'commission_percent', label: 'Комиссия площадки, %', hint: 'Резерв на будущее, сейчас не применяется' }
];

export default async function SettingsPage() {
  await requireStaff();
  const settings = await prisma.setting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Настройки площадки</h1>
        <p className="mt-1 text-sm text-muted">Меняются на лету, перезапуск не нужен.</p>
      </div>
      <div className="card-q max-w-2xl p-6">
        <SettingsForm fields={FIELDS} values={map} />
      </div>
    </div>
  );
}
