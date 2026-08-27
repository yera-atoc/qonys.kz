import type { Metadata } from 'next';
import { Unbounded, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const display = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '700'],
  variable: '--font-display'
});

const body = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body'
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://qonys.kz'),
  title: {
    default: 'Qonys.kz — подселение и аренда комнат в Казахстане',
    template: '%s · Qonys.kz'
  },
  description:
    'Найдите отдельную комнату для подселения или подходящего соседа. Фильтры по району, бюджету и привычкам. Алматы, Астана, Шымкент.',
  openGraph: {
    title: 'Qonys.kz — подселение в Казахстане',
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
