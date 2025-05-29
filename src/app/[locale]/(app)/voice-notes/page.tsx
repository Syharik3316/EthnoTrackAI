'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Square, ListChecks, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Alert, AlertDescription as AlertDescriptionUI, AlertTitle as AlertTitleUI } from "@/components/ui/alert";
import { transcribeAudio, type TranscribeAudioInput } from '@/ai/flows/transcribe-audio-flow';

interface VoiceNote {
  id: string;
  date: Date;
  transcription: string;
  audioUrl: string;
}

export default function VoiceNotesPage() {
  const t = useTranslations('VoiceNotesPage');
  const currentLocale = useLocale();
  const dateLocale = currentLocale === 'ru' ? ru : enUS;

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
          title: t('micPermissionErrorToastTitle'),
          description: t('micPermissionErrorToastDescription'),
        });
      }
    };
    getMicPermission();
    
    return () => {
        if(streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast, t]);

  const handleStartRecording = async () => {
    if (hasMicPermission === false) {
      toast({ variant: 'destructive', title: t('noMicAccessToastTitle'), description: t('noMicAccessToastDescription') });
      return;
    }
    if (hasMicPermission === null) {
        toast({ title: t('checkingPermissionsToastTitle'), description: t('checkingPermissionsToastDescription')});
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
          let transcriptionText = t('audioNotSupported'); // Default transcription

          try {
            toast({ title: t('audioTranscriptionInProgressToastTitle'), description: t('audioTranscriptionInProgressToastDescription') });
            const input: TranscribeAudioInput = { audioDataUri };
            // The transcribeAudio flow is language-agnostic in its current form, model attempts to detect.
            const transcriptionResult = await transcribeAudio(input);
            transcriptionText = transcriptionResult.transcription;
            toast({ title: t('noteSavedToastTitle'), description: t('noteSavedToastDescription') });
          } catch (transcriptionError) {
            console.error('Transcription error:', transcriptionError);
            toast({
              variant: 'destructive',
              title: t('transcriptionErrorToastTitle'),
              description: t('transcriptionErrorToastDescription'),
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
            toast({ variant: 'destructive', title: t('audioProcessingErrorToastTitle'), description: t('audioProcessingErrorToastDescription')});
            const newNote: VoiceNote = {
                id: Date.now().toString(),
                date: new Date(),
                transcription: t('audioProcessingErrorToastDescription'),
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
        toast({ variant: 'destructive', title: t('mediaRecorderErrorToastTitle'), description: t('mediaRecorderErrorToastDescription')});
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
      toast({ title: t('recordingStartedToastTitle'), description: t('recordingStartedToastDescription') });

    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        variant: 'destructive',
        title: t('failedToStartRecordingToastTitle'),
        description: t('failedToStartRecordingToastDescription'),
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
      toast({ title: t('recordingStoppedToastTitle'), description: t('recordingStoppedToastDescription') });
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
    toast({ title: t('noteDeletedToastTitle'), description: t('noteDeletedToastDescription') });
  };

  let buttonText = t('startRecordingButton');
  let buttonIcon = <Mic className="mr-2 h-5 w-5" />;

  if (processing) {
    buttonText = t('processingButton');
    buttonIcon = <Loader2 className="mr-2 h-5 w-5 animate-spin" />;
  } else if (isRecording) {
    buttonText = t('stopButton');
    buttonIcon = <Square className="mr-2 h-5 w-5" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={Mic}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('recordNoteTitle')}</CardTitle>
          <CardDescription>
            {isRecording ? t('recordingInProgress') : (processing ? t('processingInProgress') : t('clickToStartRecording'))}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {hasMicPermission === false && (
            <Alert variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitleUI>{t('micAccessDeniedTitle')}</AlertTitleUI>
              <AlertDescriptionUI>
                {t('micAccessDeniedDescription')}
              </AlertDescriptionUI>
            </Alert>
          )}
           {hasMicPermission === null && (
            <Alert className="w-full">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitleUI>{t('checkingMicPermissionTitle')}</AlertTitleUI>
              <AlertDescriptionUI>
                {t('checkingMicPermissionDescription')}
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
          <CardTitle>{t('savedNotesTitle')}</CardTitle>
          <CardDescription>{t('savedNotesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {voiceNotes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ListChecks className="h-12 w-12 mx-auto mb-2" />
              <p>{t('noSavedNotesMessage')}</p>
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
                          aria-label={t('deleteNoteAriaLabel')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line font-semibold">{t('transcriptionLabel')}</p>
                      <p className="text-sm whitespace-pre-line mb-2">{note.transcription}</p>
                      {note.audioUrl && (
                        <div className="mt-2">
                          <audio controls src={note.audioUrl} className="w-full h-10">
                            {t('audioNotSupported')}
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
