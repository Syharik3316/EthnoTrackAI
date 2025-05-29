import createMiddleware from 'next-intl/middleware';
import {locales, localePrefix, defaultLocale} from './i18n-config';

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // Used when no locale prefix is present
  defaultLocale,
  localePrefix
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ru|en)/:path*']
};
