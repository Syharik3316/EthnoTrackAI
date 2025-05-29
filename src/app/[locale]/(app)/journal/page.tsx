'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { BookOpenText, PlusCircle, FileText, Brain, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { summarizeRouteReflection, type SummarizeRouteReflectionInput, type SummarizeRouteReflectionOutput } from '@/ai/flows/summarize-route-reflection';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale'; // Added enUS for English date formatting
import { useLocale } from 'next-intl';


interface Reflection {
  id: string;
  date: Date;
  text: string;
}

export default function JournalPage() {
  const t = useTranslations('JournalPage');
  const locale = useLocale();
  const dateLocale = locale === 'ru' ? ru : enUS;

  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [currentReflection, setCurrentReflection] = useState('');
  const [journeySummary, setJourneySummary] = useState<SummarizeRouteReflectionOutput | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedReflections = localStorage.getItem('journalReflections');
    if (storedReflections) {
      setReflections(JSON.parse(storedReflections).map((r: Reflection) => ({...r, date: new Date(r.date)})));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('journalReflections', JSON.stringify(reflections));
  }, [reflections]);

  const handleAddReflection = (e: FormEvent) => {
    e.preventDefault();
    if (!currentReflection.trim()) {
      toast({ title: t('emptyEntryToastTitle'), description: t('emptyEntryToastDescription'), variant: 'destructive' });
      return;
    }
    setIsAdding(true);
    const newReflection: Reflection = {
      id: Date.now().toString(),
      date: new Date(),
      text: currentReflection,
    };
    setReflections((prev) => [newReflection, ...prev]);
    setCurrentReflection('');
    toast({ title: t('entryAddedToastTitle'), description: t('entryAddedToastDescription') });
    setIsAdding(false);
  };

  const handleSummarizeJourney = async () => {
    if (reflections.length === 0) {
      toast({ title: t('noEntriesForReportToastTitle'), description: t('noEntriesForReportToastDescription'), variant: 'destructive' });
      return;
    }
    setIsSummarizing(true);
    setJourneySummary(null);
    
    const allReflectionTexts = reflections.map(r => `Дата: ${format(r.date, 'P p', { locale: dateLocale })}\nЗапись: ${r.text}`).join('\n\n---\n\n');
    const input: SummarizeRouteReflectionInput = { reflections: allReflectionTexts };

    try {
      // Forcing summary in current locale might be complex if AI flow doesn't support it easily.
      // The flow itself should ideally handle language based on input or a parameter.
      // For now, it will use the language the reflections are written in or the flow's default.
      const summary = await summarizeRouteReflection(input);
      setJourneySummary(summary);
      toast({ title: t('reportReadyToastTitle'), description: t('reportReadyToastDescription') });
    } catch (error) {
      console.error('Journey Summary Error:', error);
      toast({
        title: t('reportErrorToastTitle'),
        description: t('reportErrorToastDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const handleDeleteReflection = (id: string) => {
    setReflections(prev => prev.filter(r => r.id !== id));
    toast({ title: t('entryDeletedToastTitle'), description: t('entryDeletedToastDescription')});
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={BookOpenText}
        actions={
            <Button onClick={handleSummarizeJourney} disabled={isSummarizing || reflections.length === 0}>
              {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
              {t('createReportButton')}
            </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>{t('newEntryTitle')}</CardTitle>
            <CardDescription>{t('newEntryDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddReflection} className="space-y-4">
              <Textarea
                placeholder={t('textareaPlaceholder')}
                value={currentReflection}
                onChange={(e) => setCurrentReflection(e.target.value)}
                rows={8}
                className="min-h-[150px]"
              />
              <Button type="submit" className="w-full" disabled={isAdding}>
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {t('addEntryButton')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>{t('yourEntriesTitle')}</CardTitle>
            <CardDescription>{t('yourEntriesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {reflections.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>{t('noEntriesMessage')}</p>
                <p className="text-xs mt-1">{t('startWritingPrompt')}</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-3">
                <div className="space-y-4">
                  {reflections.map((reflection, index) => (
                    <Card key={reflection.id} className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-medium">
                            {format(reflection.date, 'd MMMM yyyy, HH:mm', { locale: dateLocale })}
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteReflection(reflection.id)}>{t('deleteEntryButton')}</Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-line">{reflection.text}</p>
                      </CardContent>
                      {index < reflections.length -1 && <Separator className="my-2"/>}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {journeySummary && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="h-6 w-6 text-primary" />{t('journeyReportTitle')}</CardTitle>
            <CardDescription>{t('aiSummaryPrompt')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{journeySummary.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
