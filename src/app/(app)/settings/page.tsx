import { Settings as SettingsIcon } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Настройки"
        description="Управляйте настройками вашего аккаунта и приложения."
        icon={SettingsIcon}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Настройки Приложения</CardTitle>
          <CardDescription>Здесь будут доступны различные опции для кастомизации вашего опыта.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">Раздел настроек находится в разработке.</p>
            {/* Example Setting Item */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Уведомления</h3>
                <p className="text-sm text-muted-foreground">Управление push-уведомлениями и email-оповещениями.</p>
              </div>
              {/* Switch component can be added here */}
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Тема оформления</h3>
                <p className="text-sm text-muted-foreground">Выберите светлую или темную тему.</p>
              </div>
              {/* Theme toggle can be added here */}
            </div>
             <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Язык</h3>
                <p className="text-sm text-muted-foreground">Выберите язык интерфейса.</p>
              </div>
              {/* Language selector can be added here */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
