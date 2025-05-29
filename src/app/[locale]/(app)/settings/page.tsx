"use client"

import { Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation'; // Using next-intl's navigation
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/components/theme-provider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locales } from '@/i18n-config';


export default function SettingsPage() {
  const t = useTranslations('SettingsPage');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleChangeLanguage = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale});
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={SettingsIcon}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('appSettingsTitle')}</CardTitle>
          <CardDescription>{t('appSettingsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Theme Setting Item */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-sky-500" />}
                <div>
                  <h3 className="font-medium">{t('themeLabel')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('currentTheme', { themeName: theme === 'light' ? t('lightTheme') : t('darkTheme') })}
                  </p>
                </div>
              </div>
              <Switch
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label={t('toggleThemeAriaLabel')}
              />
            </div>

            {/* Language Setting Item */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{t('languageLabel')}</h3>
                <p className="text-sm text-muted-foreground">{t('languageDescription')}</p>
              </div>
              <Select onValueChange={handleChangeLanguage} value={currentLocale}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('languageSelectorDefault')} />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc === 'ru' ? t('languageSelectorRussian') : t('languageSelectorEnglish')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg opacity-50 cursor-not-allowed">
              <div>
                <h3 className="font-medium">{t('notificationsLabel')}</h3>
                <p className="text-sm text-muted-foreground">{t('notificationsDescription')}</p>
              </div>
              <Switch disabled id="notifications-switch" />
            </div>
            
             <p className="text-sm text-muted-foreground pt-4">{t('otherSettingsComingSoon')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
