import type { ReactNode } from 'react';

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // This is a placeholder layout to fix a parsing error.
  // Ideally, this [locale] path should not be active after i18n rollback.
  console.warn(
    `[WARN] LocaleLayout rendering for locale: ${params.locale}. This path should ideally not be active if i18n rollback was complete. Check routing and ensure src/app/[locale] directory is cleaned up if not intended.`
  );
  return (
    <html lang={params.locale}>
      <body>
        {children}
      </body>
    </html>
  );
}
