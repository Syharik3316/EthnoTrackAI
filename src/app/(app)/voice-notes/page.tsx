
'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Square, ListChecks, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Alert, AlertDescription as AlertDescriptionUI, AlertTitle as AlertTitleUI } from "@/components/ui/alert"; // Renamed to avoid conflict

interface VoiceNote {
  id: string;
  date: Date;
  transcription: string;
  audioUrl: string; // URL для воспроизведения аудио
}

export default function VoiceNotesPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [processing, setProcessing] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load voice notes from local storage on mount
  useEffect(() => {
    const storedVoiceNotes = localStorage.getItem('voiceNotes');
    if (storedVoiceNotes) {
      setVoiceNotes(JSON.parse(storedVoiceNotes).map((vn: VoiceNote) => ({...vn, date: new Date(vn.date)})));
    }
  }, []);

  // Save voice notes to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('voiceNotes', JSON.stringify(voiceNotes));
  }, [voiceNotes]);

  // Request microphone permission on mount
  useEffect(() => {
    const getMicPermission = async () => {
      try {
        // Запрос только для проверки, не для начала записи
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Важно остановить треки сразу после проверки, чтобы индикатор микрофона не горел постоянно
        stream.getTracks().forEach(track => track.stop());
        setHasMicPermission(true);
      } catch (error) {
        console.error('Ошибка доступа к микрофону:', error);
        setHasMicPermission(false);
        toast({
          variant: 'destructive',
          title: 'Доступ к Микрофону Отклонен',
          description: 'Пожалуйста, разрешите доступ к микрофону в настройках браузера.',
        });
      }
    };
    getMicPermission();
  }, [toast]);

  const handleStartRecording = async () => {
    if (hasMicPermission === false) {
      toast({
        variant: 'destructive',
        title: 'Нет Доступа к Микрофону',
        description: 'Разрешите доступ к микрофону для записи.',
      });
      return;
    }
    if (hasMicPermission === null) {
        toast({
          title: 'Проверка Разрешений',
          description: 'Пожалуйста, подождите, пока проверяется доступ к микрофону.',
        });
        return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Сохраняем аудиофайл (в данном случае URL)
        const newNote: VoiceNote = {
          id: Date.now().toString(),
          date: new Date(),
          transcription: "Пример расшифрованной голосовой заметки.", // Симулированная расшифровка
          audioUrl: audioUrl,
        };
        setVoiceNotes(prev => [newNote, ...prev]);
        toast({ title: 'Заметка Сохранена', description: 'Голосовая заметка записана и сохранена.' });
        setProcessing(false);
        // Очищаем треки после использования
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('Ошибка MediaRecorder:', event);
        toast({ variant: 'destructive', title: 'Ошибка Записи', description: 'Произошла ошибка во время записи.'});
        setProcessing(false);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setProcessing(false); // Начинаем запись, не "обработку"
      toast({ title: 'Запись Начата', description: 'Говорите в микрофон...' });

    } catch (error) {
      console.error('Не удалось начать запись:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка Начала Записи',
        description: 'Не удалось получить доступ к микрофону или начать запись.',
      });
      setProcessing(false);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setProcessing(true); // Начинаем обработку после остановки
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // toast про успешное сохранение будет вызван в onstop
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleDeleteNote = (id: string) => {
    const noteToDelete = voiceNotes.find(note => note.id === id);
    if (noteToDelete && noteToDelete.audioUrl) {
      // Освобождаем URL объекта, если он был создан через URL.createObjectURL()
      // Это важно для предотвращения утечек памяти
      if (noteToDelete.audioUrl.startsWith('blob:')) {
         URL.revokeObjectURL(noteToDelete.audioUrl);
      }
    }
    setVoiceNotes(prev => prev.filter(note => note.id !== id));
    toast({ title: 'Заметка Удалена', description: 'Голосовая заметка удалена.' });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Голосовые Заметки"
        description="Записывайте свои мысли на ходу и получайте текстовую расшифровку."
        icon={Mic}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Запись Голосовой Заметки</CardTitle>
          <CardDescription>
            {isRecording ? 'Идет запись... Нажмите кнопку, чтобы остановить.' : 'Нажмите кнопку, чтобы начать запись.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {hasMicPermission === false && (
            <Alert variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitleUI>Доступ к микрофону запрещен</AlertTitleUI>
              <AlertDescriptionUI>
                Пожалуйста, разрешите доступ к микрофону в настройках вашего браузера, чтобы записывать голосовые заметки.
              </AlertDescriptionUI>
            </Alert>
          )}
           {hasMicPermission === null && (
            <Alert className="w-full">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitleUI>Проверка доступа к микрофону...</AlertTitleUI>
              <AlertDescriptionUI>
                Пожалуйста, подождите.
              </AlertDescriptionUI>
            </Alert>
          )}
          <Button
            size="lg"
            onClick={handleToggleRecording}
            disabled={processing || hasMicPermission !== true}
            className={`w-48 transition-all duration-300 ease-in-out ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'}`}
          >
            {processing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : isRecording ? (
              <Square className="mr-2 h-5 w-5" />
            ) : (
              <Mic className="mr-2 h-5 w-5" />
            )}
            {processing ? 'Обработка...' : isRecording ? 'Остановить' : 'Начать Запись'}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Сохраненные Заметки</CardTitle>
          <CardDescription>Ваши ранее записанные голосовые заметки. Расшифровка симулирована.</CardDescription>
        </CardHeader>
        <CardContent>
          {voiceNotes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ListChecks className="h-12 w-12 mx-auto mb-2" />
              <p>У вас пока нет сохраненных голосовых заметок.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-3">
              <div className="space-y-4">
                {voiceNotes.map((note) => (
                  <Card key={note.id} className="bg-muted/50">
                    <CardHeader className="pb-2 pt-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium">
                          {format(note.date, 'd MMMM yyyy, HH:mm', { locale: ru })}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNote(note.id)}
                          className="h-8 w-8"
                          aria-label="Удалить заметку"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line">{note.transcription}</p>
                      {note.audioUrl && (
                        <div className="mt-2">
                          <audio controls src={note.audioUrl} className="w-full h-10">
                            Ваш браузер не поддерживает элемент <code>audio</code>.
                          </audio>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

