import { Map as MapIcon, Compass } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import YandexMap from '@/components/yandex-map'; // Импортируем новый компонент

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Интерактивная Карта" // Вернул заголовок, так как "Rfhf" было скорее всего тестовым
        description="Исследуйте культурные маршруты и находите интересные места."
        icon={MapIcon}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary" />
              Карта Маршрутов
            </CardTitle>
            <CardDescription>
              Интерактивная карта для исследования маршрутов и достопримечательностей.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <YandexMap />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
