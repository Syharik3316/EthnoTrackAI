'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { BookOpenText, PlusCircle, FileText, Brain, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { summarizeRouteReflection, type SummarizeRouteReflectionInput, type SummarizeRouteReflectionOutput } from '@/ai/flows/summarize-route-reflection';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';


interface Reflection {
  id: string;
  date: Date;
  text: string;
}

export default function JournalPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [currentReflection, setCurrentReflection] = useState('');
  const [journeySummary, setJourneySummary] = useState<SummarizeRouteReflectionOutput | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // Load reflections from local storage on mount
  useEffect(() => {
    const storedReflections = localStorage.getItem('journalReflections');
    if (storedReflections) {
      setReflections(JSON.parse(storedReflections).map((r: Reflection) => ({...r, date: new Date(r.date)})));
    }
  }, []);

  // Save reflections to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('journalReflections', JSON.stringify(reflections));
  }, [reflections]);

  const handleAddReflection = (e: FormEvent) => {
    e.preventDefault();
    if (!currentReflection.trim()) {
      toast({ title: 'Пустая Запись', description: 'Пожалуйста, напишите что-нибудь.', variant: 'destructive' });
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
    toast({ title: 'Запись Добавлена', description: 'Ваши мысли сохранены в дневнике.' });
    setIsAdding(false);
  };

  const handleSummarizeJourney = async () => {
    if (reflections.length === 0) {
      toast({ title: 'Нет Записей', description: 'Напишите что-нибудь в дневник, чтобы создать отчет.', variant: 'destructive' });
      return;
    }
    setIsSummarizing(true);
    setJourneySummary(null);
    
    const allReflectionTexts = reflections.map(r => `Дата: ${format(r.date, 'P p', { locale: ru })}\nЗапись: ${r.text}`).join('\n\n---\n\n');
    const input: SummarizeRouteReflectionInput = { reflections: allReflectionTexts };

    try {
      const summary = await summarizeRouteReflection(input);
      setJourneySummary(summary);
      toast({ title: 'Отчет Готов!', description: 'Итоговый отчет о вашем путешествии создан.' });
    } catch (error) {
      console.error('Journey Summary Error:', error);
      toast({
        title: 'Ошибка Создания Отчета',
        description: 'Не удалось создать отчет. Попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const handleDeleteReflection = (id: string) => {
    setReflections(prev => prev.filter(r => r.id !== id));
    toast({ title: 'Запись удалена', description: 'Запись была успешно удалена из дневника.'});
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Цифровой Дневник"
        description="Записывайте свои впечатления и создавайте отчет о путешествии."
        icon={BookOpenText}
        actions={
            <Button onClick={handleSummarizeJourney} disabled={isSummarizing || reflections.length === 0}>
              {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
              Создать Отчет о Путешествии
            </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>Новая Запись</CardTitle>
            <CardDescription>Поделитесь своими мыслями и впечатлениями.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddReflection} className="space-y-4">
              <Textarea
                placeholder="Что нового сегодня? Какие мысли, эмоции, события?"
                value={currentReflection}
                onChange={(e) => setCurrentReflection(e.target.value)}
                rows={8}
                className="min-h-[150px]"
              />
              <Button type="submit" className="w-full" disabled={isAdding}>
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Добавить Запись
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Ваши Записи</CardTitle>
            <CardDescription>Просмотрите свои предыдущие размышления.</CardDescription>
          </CardHeader>
          <CardContent>
            {reflections.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>В вашем дневнике пока нет записей.</p>
                <p className="text-xs mt-1">Начните писать, чтобы сохранить воспоминания!</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-3">
                <div className="space-y-4">
                  {reflections.map((reflection, index) => (
                    <Card key={reflection.id} className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-medium">
                            {format(reflection.date, 'd MMMM yyyy, HH:mm', { locale: ru })}
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteReflection(reflection.id)}>Удалить</Button>
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
            <CardTitle className="flex items-center gap-2"><Brain className="h-6 w-6 text-primary" />Итоговый Отчет о Путешествии</CardTitle>
            <CardDescription>Сгенерированный AI обзор ваших приключений.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{journeySummary.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
