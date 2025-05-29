import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/page-header';
import { AiGuideChat } from '@/components/ai-guide-chat';

export default function AiGuidePage() {
  const t = useTranslations('AiGuidePage');
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={Sparkles}
      />
      <AiGuideChat />
    </div>
  );
}
