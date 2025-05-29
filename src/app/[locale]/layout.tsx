import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../globals.css'; // Adjusted path
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getTranslator } from 'next-intl/server';
import type { AppLocale } from '@/i18n-config';

const geistSans = GeistSans;
const geistMono = GeistMono;

// export const metadata: Metadata = { // Metadata will be generated dynamically
//   title: 'EthnoTrack AI',
//   description: 'Interactive cultural and auto-tourism platform with AI guides.',
// };

export async function generateMetadata({params: {locale}}: {params: {locale: AppLocale}}): Promise<Metadata> {
  const t = await getTranslator(locale, 'RootLayout');
 
  return {
    title: t('title'),
    description: t('description'),
  };
}


export default function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  const messages = useMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="ethnotrack-theme"
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
