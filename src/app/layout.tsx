import type { Metadata } from 'next';
import { Onest, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const display = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display'
});

const body = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body'
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://qonys.kz'),
  title: {
    default: 'Qonys.kz — подселение и поиск соседей в Алматы',
    template: '%s · Qonys.kz'
  },
  description:
    'Найди отдельную комнату для подселения или подходящего соседа в Алматы. Фильтры по району, бюджету и привычкам.',
  openGraph: {
    title: 'Qonys — подселение в Алматы',
    description: 'Двусторонняя площадка для поиска подселения и соседей.',
    type: 'website',
    locale: 'ru_KZ'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
