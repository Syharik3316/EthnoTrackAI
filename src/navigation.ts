import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';
import {locales, localePrefix, defaultLocale} from './i18n-config';

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({
    locales,
    localePrefix,
    pathnames: {
      // If all your pathnames are the same across locales, you don't
      // need to define anything here.
    }
  });
