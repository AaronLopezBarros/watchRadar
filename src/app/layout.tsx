import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import { getDictionary } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/getLocale';
import { Header } from '@/src/components/Header';
import { LocaleProvider } from '@/src/components/LocaleProvider';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return {
    title: 'WatchRadar',
    description: dict.meta.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className='overflow-x-hidden'>
      <body className={`${plusJakartaSans.className} h-screen overflow-x-hidden bg-slate-950 antialiased`}>
        <div className='fixed inset-0 -z-10 bg-linear-to-b from-indigo-950 via-blue-950 to-slate-950' />
        <Header />
        <LocaleProvider locale={locale}>
          <main>{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
