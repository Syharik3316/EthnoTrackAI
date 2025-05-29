import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n-config';

export default function RootPage() {
  // Redirect to the default locale's dashboard
  // Or handle locale detection from headers if preferred
  redirect(`/${defaultLocale}/dashboard`); 
  return null;
}
