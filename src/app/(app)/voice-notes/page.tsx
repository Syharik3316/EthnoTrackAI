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
  const pageTitle = "Голосовые Заметки";
  const pageDescription = "Записывайте свои мысли на ходу и получайте AI расшифровку.";
  const recordNoteTitle = "Запись Голосовой Заметки";
  const recordingInProgress = "Идет запись... Нажмите кнопку, чтобы остановить.";
  const processingInProgress = "Идет обработка, подождите...";
  const clickToStartRecording = "Нажмите кнопку, чтобы начать запись.";
  const micAccessDeniedTitle = "Доступ к микрофону запрещен";
  const micAccessDeniedDescription = "Пожалуйста, разрешите доступ к микрофону в настройках вашего браузера, чтобы записывать голосовые заметки.";
  const checkingMicPermissionTitle = "Проверка доступа к микрофону...";
  const checkingMicPermissionDescription = "Пожалуйста, подождите.";
  const startRecordingButton = "Начать Запись";
  const processingButton = "Обработка...";
  const stopButton = "Остановить";
  const savedNotesTitle = "Сохраненные Заметки";
  const savedNotesDescription = "Ваши ранее записанные и расшифрованные голосовые заметки.";
  const noSavedNotesMessage = "У вас пока нет сохраненных голосовых заметок.";
  const transcriptionLabel = "Расшифровка:";
  const audioNotSupported = "Ваш браузер не поддерживает элемент audio.";
  const deleteNoteAriaLabel = "Удалить заметку";
  const micPermissionErrorToastTitle = "Доступ к Микрофону Отклонен";
  const micPermissionErrorToastDescription = "Пожалуйста, разрешите доступ к микрофону в настройках браузера.";
  const checkingPermissionsToastTitle = "Проверка Разрешений";
  const checkingPermissionsToastDescription = "Пожалуйста, подождите, пока проверяется доступ к микрофону.";
  const noMicAccessToastTitle = "Нет Доступа к Микрофону";
  const noMicAccessToastDescription = "Разрешите доступ к микрофону для записи.";
  const audioTranscriptionInProgressToastTitle = "Расшифровка Аудио...";
  const audioTranscriptionInProgressToastDescription = "ИИ обрабатывает вашу запись. Пожалуйста, подождите.";
  const noteSavedToastTitle = "Заметка Сохранена";
  const noteSavedToastDescription = "Голосовая заметка записана и расшифрована.";
  const transcriptionErrorToastTitle = "Ошибка Расшифровки";
  const transcriptionErrorToastDescription = "Не удалось расшифровать аудио. Заметка сохранена с аудио.";
  const audioProcessingErrorToastTitle = "Ошибка Обработки Аудио";
  const audioProcessingErrorToastDescription = "Не удалось обработать записанное аудио.";
  const mediaRecorderErrorToastTitle = "Ошибка Записи";
  const mediaRecorderErrorToastDescription = "Произошла ошибка во время записи.";
  const failedToStartRecordingToastTitle = "Ошибка Начала Записи";
  const failedToStartRecordingToastDescription = "Не удалось получить доступ к микрофону или начать запись.";
  const recordingStartedToastTitle = "Запись Начата";
  const recordingStartedToastDescription = "Говорите в микрофон...";
  const recordingStoppedToastTitle = "Запись Остановлена";
  const recordingStoppedToastDescription = "Начинается обработка и расшифровка...";
  const noteDeletedToastTitle = "Заметка Удалена";
  const noteDeletedToastDescription = "Голосовая заметка удалена.";

  const dateLocale = ru;

  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [processing, setProcessing] = useState(false);
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
        stream.getTracks().forEach(track => track.stop());
        setHasMicPermission(true);
      } catch (error) {
        console.error('Microphone access error:', error);
        setHasMicPermission(false);
        toast({
          variant: 'destructive',
          title: micPermissionErrorToastTitle,
          description: micPermissionErrorToastDescription,
        });
      }
    };
    getMicPermission();
    
    return () => {
        if(streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleStartRecording = async () => {
    if (hasMicPermission === false) {
      toast({ variant: 'destructive', title: noMicAccessToastTitle, description: noMicAccessToastDescription });
      return;
    }
    if (hasMicPermission === null) {
        toast({ title: checkingPermissionsToastTitle, description: checkingPermissionsToastDescription});
        return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
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
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const audioDataUri = reader.result as string;
          let transcriptionText = audioNotSupported; 

          try {
            toast({ title: audioTranscriptionInProgressToastTitle, description: audioTranscriptionInProgressToastDescription });
            const input: TranscribeAudioInput = { audioDataUri };
            const transcriptionResult = await transcribeAudio(input);
            transcriptionText = transcriptionResult.transcription;
            toast({ title: noteSavedToastTitle, description: noteSavedToastDescription });
          } catch (transcriptionError) {
            console.error('Transcription error:', transcriptionError);
            toast({
              variant: 'destructive',
              title: transcriptionErrorToastTitle,
              description: transcriptionErrorToastDescription,
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
            console.error("Error reading Blob as Data URL");
            toast({ variant: 'destructive', title: audioProcessingErrorToastTitle, description: audioProcessingErrorToastDescription});
            const newNote: VoiceNote = {
                id: Date.now().toString(),
                date: new Date(),
                transcription: audioProcessingErrorToastDescription,
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
        console.error('MediaRecorder Error:', event);
        toast({ variant: 'destructive', title: mediaRecorderErrorToastTitle, description: mediaRecorderErrorToastDescription});
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
      toast({ title: recordingStartedToastTitle, description: recordingStartedToastDescription });

    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        variant: 'destructive',
        title: failedToStartRecordingToastTitle,
        description: failedToStartRecordingToastDescription,
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
      toast({ title: recordingStoppedToastTitle, description: recordingStoppedToastDescription });
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
    toast({ title: noteDeletedToastTitle, description: noteDeletedToastDescription });
  };

  let buttonText = startRecordingButton;
  let buttonIcon = <Mic className="mr-2 h-5 w-5" />;

  if (processing) {
    buttonText = processingButton;
    buttonIcon = <Loader2 className="mr-2 h-5 w-5 animate-spin" />;
  } else if (isRecording) {
    buttonText = stopButton;
    buttonIcon = <Square className="mr-2 h-5 w-5" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        icon={Mic}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{recordNoteTitle}</CardTitle>
          <CardDescription>
            {isRecording ? recordingInProgress : (processing ? processingInProgress : clickToStartRecording)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {hasMicPermission === false && (
            <Alert variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitleUI>{micAccessDeniedTitle}</AlertTitleUI>
              <AlertDescriptionUI>
                {micAccessDeniedDescription}
              </AlertDescriptionUI>
            </Alert>
          )}
           {hasMicPermission === null && (
            <Alert className="w-full">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitleUI>{checkingMicPermissionTitle}</AlertTitleUI>
              <AlertDescriptionUI>
                {checkingMicPermissionDescription}
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
          <CardTitle>{savedNotesTitle}</CardTitle>
          <CardDescription>{savedNotesDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {voiceNotes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ListChecks className="h-12 w-12 mx-auto mb-2" />
              <p>{noSavedNotesMessage}</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-3">
              <div className="space-y-4">
                {voiceNotes.map((note) => (
                  <Card key={note.id} className="bg-muted/50">
                    <CardHeader className="pb-2 pt-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium">
                          {format(note.date, 'd MMMM yyyy, HH:mm', { locale: dateLocale })}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNote(note.id)}
                          className="h-8 w-8"
                          aria-label={deleteNoteAriaLabel}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line font-semibold">{transcriptionLabel}</p>
                      <p className="text-sm whitespace-pre-line mb-2">{note.transcription}</p>
                      {note.audioUrl && (
                        <div className="mt-2">
                          <audio controls src={note.audioUrl} className="w-full h-10">
                            {audioNotSupported}
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
