import { MountainSnow } from 'lucide-react';
// import Link from 'next/link'; // Use next-intl Link
import { Link } from '@/navigation'; // Use next-intl Link
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppHeader() {
  const t = useTranslations();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>
      <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <MountainSnow className="h-6 w-6 text-primary" />
        <span className="sr-only">{t('EthnoTrackAI')}</span>
      </Link>
      <h1 className="hidden text-xl font-semibold md:block">{t('EthnoTrackAI')}</h1>
    </header>
  );
}
