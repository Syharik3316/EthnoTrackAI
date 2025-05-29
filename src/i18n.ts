import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import type {AppLocale} from './i18n-config';

// Can be imported from a shared config
const locales: AppLocale[] = ['en', 'ru'];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as AppLocale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});