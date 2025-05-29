
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
import { Alert, AlertDescription as AlertDescriptionUI, AlertTitle as AlertTitleUI } from "@/components/ui/alert";
import { transcribeAudio, type TranscribeAudioInput } from '@/ai/flows/transcribe-audio-flow';

interface VoiceNote {
  id: string;
  date: Date;
  transcription: string;
  audioUrl: string;
}

export default function VoiceNotesPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [processing, setProcessing] = useState(false); // Used for recording stop, blob conversion, and AI transcription
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);


  useEffect(() => {
    const storedVoiceNotes = localStorage.getItem('voiceNotes');
    if (storedVoiceNotes) {
      setVoiceNotes(JSON.parse(storedVoiceNotes).map((vn: VoiceNote) => ({...vn, date: new Date(vn.date)})));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('voiceNotes', JSON.stringify(voiceNotes));
  }, [voiceNotes]);

  useEffect(() => {
    const getMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop tracks immediately after permission check
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
    
    return () => { // Cleanup stream on component unmount
        if(streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleStartRecording = async () => {
    if (hasMicPermission === false) {
      toast({ variant: 'destructive', title: 'Нет Доступа к Микрофону', description: 'Разрешите доступ к микрофону для записи.' });
      return;
    }
    if (hasMicPermission === null) {
        toast({ title: 'Проверка Разрешений', description: 'Пожалуйста, подождите, пока проверяется доступ к микрофону.'});
        return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Store stream to stop tracks later
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Stream tracks are stopped in the finally block after transcription or error

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const audioDataUri = reader.result as string;
          let transcriptionText = "Аудио не распознано.";

          try {
            toast({ title: 'Расшифровка Аудио...', description: 'ИИ обрабатывает вашу запись. Пожалуйста, подождите.' });
            const input: TranscribeAudioInput = { audioDataUri };
            const transcriptionResult = await transcribeAudio(input);
            transcriptionText = transcriptionResult.transcription;
            toast({ title: 'Заметка Сохранена', description: 'Голосовая заметка записана и расшифрована.' });
          } catch (transcriptionError) {
            console.error('Ошибка расшифровки:', transcriptionError);
            toast({
              variant: 'destructive',
              title: 'Ошибка Расшифровки',
              description: 'Не удалось расшифровать аудио. Заметка сохранена с аудио.',
            });
          } finally {
            const newNote: VoiceNote = {
              id: Date.now().toString(),
              date: new Date(),
              transcription: transcriptionText,
              audioUrl: audioUrl,
            };
            setVoiceNotes(prev => [newNote, ...prev]);
            setProcessing(false);
             if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
          }
        };
        reader.onerror = () => {
            console.error("Ошибка чтения Blob как Data URL");
            toast({ variant: 'destructive', title: 'Ошибка Обработки Аудио', description: 'Не удалось обработать записанное аудио.'});
            const newNote: VoiceNote = {
                id: Date.now().toString(),
                date: new Date(),
                transcription: "Ошибка обработки аудиофайла.",
                audioUrl: audioUrl,
            };
            setVoiceNotes(prev => [newNote, ...prev]);
            setProcessing(false);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('Ошибка MediaRecorder:', event);
        toast({ variant: 'destructive', title: 'Ошибка Записи', description: 'Произошла ошибка во время записи.'});
        setProcessing(false);
        setIsRecording(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setProcessing(false); 
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
      setProcessing(true); 
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({ title: 'Запись Остановлена', description: 'Начинается обработка и расшифровка...' });
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
      if (noteToDelete.audioUrl.startsWith('blob:')) {
         URL.revokeObjectURL(noteToDelete.audioUrl);
      }
    }
    setVoiceNotes(prev => prev.filter(note => note.id !== id));
    toast({ title: 'Заметка Удалена', description: 'Голосовая заметка удалена.' });
  };

  let buttonText = 'Начать Запись';
  let buttonIcon = <Mic className="mr-2 h-5 w-5" />;

  if (processing) {
    buttonText = 'Обработка...';
    buttonIcon = <Loader2 className="mr-2 h-5 w-5 animate-spin" />;
  } else if (isRecording) {
    buttonText = 'Остановить';
    buttonIcon = <Square className="mr-2 h-5 w-5" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Голосовые Заметки"
        description="Записывайте свои мысли на ходу и получайте AI расшифровку."
        icon={Mic}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Запись Голосовой Заметки</CardTitle>
          <CardDescription>
            {isRecording ? 'Идет запись... Нажмите кнопку, чтобы остановить.' : (processing ? 'Идет обработка, подождите...' : 'Нажмите кнопку, чтобы начать запись.')}
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
            disabled={processing || (!isRecording && hasMicPermission !== true)}
            className={`w-48 transition-all duration-300 ease-in-out ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'}`}
          >
            {buttonIcon}
            {buttonText}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Сохраненные Заметки</CardTitle>
          <CardDescription>Ваши ранее записанные и расшифрованные голосовые заметки.</CardDescription>
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
                      <p className="text-sm whitespace-pre-line font-semibold">Расшифровка:</p>
                      <p className="text-sm whitespace-pre-line mb-2">{note.transcription}</p>
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
