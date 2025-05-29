import { Map as MapIcon, Compass } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Интерактивная Карта"
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
              Здесь будет отображаться интерактивная карта с маршрутами, парками, отелями и заправками.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="relative w-full h-[500px] bg-muted rounded-lg flex items-center justify-center border border-dashed"
              aria-label="Область для интерактивной карты"
            >
              <Image 
                src="https://placehold.co/800x500.png" 
                alt="Placeholder карты" 
                layout="fill" 
                objectFit="cover" 
                className="rounded-lg opacity-50"
                data-ai-hint="map route"
              />
              <p className="z-10 text-xl font-semibold text-foreground p-4 bg-background/70 rounded-md">Интерактивная Карта (в разработке)</p>
            </div>
          </CardContent>
        </Card>
        
        {/* This section can be used for quick links or stats later */}
        {/* <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Быстрые ссылки</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Ссылки на популярные регионы или функции.</p>
            </CardContent>
          </Card>
        </div> */}
      </div>
       {/* Consider moving AI Guide to its own page /ai-guide or a modal accessible from everywhere */}
       {/* For now, it's removed from dashboard to simplify the page. Users can access it via sidebar. */}
    </div>
  );
}
