import { redirect } from 'next/navigation';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { ThreadList } from '@/components/chat/ThreadList';
import { getT } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

export default async function ChatListPage() {
  const me = await currentUser();
  if (!me) redirect('/login?callbackUrl=/cabinet/chat');
  const { t } = getT();

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">{t.chat.title}</h1>
        <Link href="/cabinet/support" className="btn-ghost btn-sm">
          {t.nav.support}
        </Link>
      </div>
      <ThreadList meId={me.id} />
    </section>
  );
}
