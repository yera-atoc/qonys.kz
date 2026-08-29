'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';

/**
 * Кнопка «Написать в чате» на карточке объявления.
 *
 * Стоит выше платного открытия контактов и бесплатна намеренно: сначала
 * ликвидность и первый контакт, монетизация — на телефоне и продвижении.
 */
export function MessageAuthorButton({ listingId, signedIn }: { listingId: string; signedIn: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <Link href={`/login?callbackUrl=/listing/${listingId}`} className="btn-primary mt-6 w-full">
        {t.listing.loginToWrite}
      </Link>
    );
  }

  async function open() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(t.common.error);
        return;
      }
      router.push(`/cabinet/chat/${data.id}`);
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button onClick={() => void open()} disabled={loading} className="btn-primary w-full">
        {loading ? t.common.loading : t.listing.write}
      </button>
      <p className="mt-2 text-center text-[13px] text-muted">{t.listing.writeFree}</p>
      {error && <p className="mt-2 text-center text-[13px] text-danger">{error}</p>}
    </div>
  );
}
