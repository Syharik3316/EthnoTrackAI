// src/app/[locale]/page.tsx
import type { ReactNode } from 'react';

interface LocalePageProps {
  params: { locale: string };
}

export default function LocalePage({ params }: LocalePageProps) {
  // This is a placeholder page to fix a parsing error.
  // Ideally, this [locale] path should not be active after i18n rollback.
  console.warn(
    `[WARN] LocalePage rendering for locale: ${params.locale}. This path should ideally not be active if i18n rollback was complete. Check routing and ensure src/app/[locale] directory is cleaned up if not intended.`
  );
  return (
    <div>
      <h1>Locale Page ({params.locale})</h1>
      <p>This is a placeholder page.</p>
    </div>
  );
}
