"use client"

import { Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation'; 
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/components/theme-provider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  // const router = useRouter(); // Not used in this reverted version
  // const pathname = usePathname(); // Not used in this reverted version
  // const currentLocale = 'ru'; // Hardcoded for simplicity in rollback

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // const handleChangeLanguage = (newLocale: string) => {
  //   router.replace(pathname, {locale: newLocale}); // This would require i18n setup
  // };
  
  // Hardcoded Russian strings
  const pageTitle = "Настройки";
  const pageDescription = "Управляйте настройками вашего аккаунта и приложения.";
  const appSettingsTitle = "Настройки Приложения";
  const appSettingsDescription = "Здесь будут доступны различные опции для кастомизации вашего опыта.";
  const themeLabel = "Тема оформления";
  const currentThemeText = `Текущая тема: ${theme === 'light' ? "Светлая" : "Темная"}`;
  const toggleThemeAriaLabel = "Переключить тему оформления";
  const languageLabel = "Язык";
  const languageDescription = "Выберите язык интерфейса.";
  const languageSelectorDefault = "Русский";
  const notificationsLabel = "Уведомления";
  const notificationsDescription = "Управление push-уведомлениями и email-оповещениями.";
  const otherSettingsComingSoon = "Другие настройки будут доступны в будущих обновлениях.";


  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        icon={SettingsIcon}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{appSettingsTitle}</CardTitle>
          <CardDescription>{appSettingsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Theme Setting Item */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-sky-500" />}
                <div>
                  <h3 className="font-medium">{themeLabel}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentThemeText}
                  </p>
                </div>
              </div>
              <Switch
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label={toggleThemeAriaLabel}
              />
            </div>

            {/* Language Setting Item - Placeholder/Disabled */}
            <div className="flex items-center justify-between p-4 border rounded-lg opacity-50 cursor-not-allowed">
              <div>
                <h3 className="font-medium">{languageLabel}</h3>
                <p className="text-sm text-muted-foreground">{languageDescription}</p>
              </div>
              <Select disabled value="ru">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={languageSelectorDefault} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">{languageSelectorDefault}</SelectItem>
                  {/* <SelectItem value="en">Английский</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg opacity-50 cursor-not-allowed">
              <div>
                <h3 className="font-medium">{notificationsLabel}</h3>
                <p className="text-sm text-muted-foreground">{notificationsDescription}</p>
              </div>
              <Switch disabled id="notifications-switch" />
            </div>
            
             <p className="text-sm text-muted-foreground pt-4">{otherSettingsComingSoon}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
