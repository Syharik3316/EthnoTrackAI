import { Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { AiGuideChat } from '@/components/ai-guide-chat';

export default function AiGuidePage() {
  const pageTitle = "Интерактивный AI Гид";
  const pageDescription = "Задавайте вопросы о маршруте, достопримечательностях и культуре.";
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        icon={Sparkles}
      />
      <AiGuideChat />
    </div>
  );
}
