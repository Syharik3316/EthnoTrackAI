import type {LocalePrefix} from 'next-intl/routing';

export const defaultLocale = 'ru' as const;
export const locales = ['ru', 'en'] as const;

export const localePrefix: LocalePrefix = 'always'; // Or 'as-needed' or 'never'

export type AppLocale = typeof locales[number];