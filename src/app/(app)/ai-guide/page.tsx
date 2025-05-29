import { Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { AiGuideChat } from '@/components/ai-guide-chat';

export default function AiGuidePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Интерактивный AI Гид"
        description="Задавайте вопросы о маршруте, достопримечательностях и культуре."
        icon={Sparkles}
      />
      <AiGuideChat />
    </div>
  );
}
