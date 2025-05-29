
"use client"

import { Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/components/theme-provider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

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
          <div className="space-y-6">
            {/* Theme Setting Item */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-sky-500" />}
                <div>
                  <h3 className="font-medium">Тема оформления</h3>
                  <p className="text-sm text-muted-foreground">
                    Текущая тема: {theme === 'light' ? 'Светлая' : 'Темная'}
                  </p>
                </div>
              </div>
              <Switch
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label="Переключить тему оформления"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg opacity-50 cursor-not-allowed">
              <div>
                <h3 className="font-medium">Уведомления</h3>
                <p className="text-sm text-muted-foreground">Управление push-уведомлениями и email-оповещениями.</p>
              </div>
              <Switch disabled id="notifications-switch" />
            </div>
            
             <div className="flex items-center justify-between p-4 border rounded-lg opacity-50 cursor-not-allowed">
              <div>
                <h3 className="font-medium">Язык</h3>
                <p className="text-sm text-muted-foreground">Выберите язык интерфейса.</p>
              </div>
              {/* Language selector can be added here, for now a disabled placeholder */}
              <select disabled className="p-2 border rounded-md bg-input text-sm text-muted-foreground">
                <option>Русский</option>
              </select>
            </div>
             <p className="text-sm text-muted-foreground pt-4">Другие настройки будут доступны в будущих обновлениях.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
