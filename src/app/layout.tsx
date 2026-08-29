import type { Metadata } from 'next';
import { Onest, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary, LOCALE_META, LOCALES } from '@/lib/i18n';

const display = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display'
});

const body = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body'
});

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://qonys.kz';

// Метаданные считаются на языке пользователя: og:locale, og:title и описание
// должны совпадать с тем, что человек увидит, открыв ссылку.
export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getDictionary(locale);

  const title = `Qonys — ${t.common.tagline}`;
  const description = t.home.subtitle;

  return {
    metadataBase: new URL(SITE),
    title: { default: title, template: '%s · Qonys' },
    description,
    alternates: {
      canonical: '/',
      languages: Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].htmlLang, '/']))
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
      siteName: 'Qonys',
      // PNG, а не SVG: Telegram, WhatsApp и Facebook не рендерят SVG в превью
      images: [{ url: '/og.png', width: 1200, height: 630, alt: title }]
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
    icons: { icon: '/logo.svg', shortcut: '/logo.svg', apple: '/apple-touch-icon.png' }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();

  return (
    <html lang={LOCALE_META[locale].htmlLang} className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
