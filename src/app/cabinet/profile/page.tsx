import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { ProfileForm } from '@/components/ProfileForm';

export const metadata = { title: 'Профиль' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const me = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Профиль</h1>
        <p className="mt-1 text-sm text-muted">
          Эти данные видят в карточке объявления. Телефон скрыт до открытия контактов.
        </p>
      </div>
      <div className="card-q p-6">
        <ProfileForm
          user={{
            name: user.name,
            phone: user.phone,
            email: user.email,
            birthYear: user.birthYear,
            gender: user.gender,
            occupation: user.occupation,
            about: user.about
          }}
        />
      </div>
    </div>
  );
}
