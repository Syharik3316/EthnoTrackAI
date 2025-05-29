'use client';

import { useState, useEffect } from 'react';
import { Mic, Square, ListChecks, Trash2, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface VoiceNote {
  id: string;
  date: Date;
  transcription: string;
  audioUrl?: string; // For future playback
}

export default function VoiceNotesPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [processing, setProcessing] = useState(false); // For simulated processing
  const { toast } = useToast();

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

  const handleToggleRecording = () => {
    // This is a placeholder for actual recording logic.
    // In a real app, you'd use browser MediaRecorder API.
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setProcessing(true);
      // Simulate transcription
      setTimeout(() => {
        const newNoteText = currentTranscription || "Пример расшифрованной голосовой заметки.";
        const newNote: VoiceNote = {
          id: Date.now().toString(),
          date: new Date(),
          transcription: newNoteText,
        };
        setVoiceNotes(prev => [newNote, ...prev]);
        setCurrentTranscription('');
        toast({ title: 'Заметка Сохранена', description: 'Голосовая заметка расшифрована и сохранена.' });
        setProcessing(false);
      }, 1500);
    } else {
      // Start recording
      setIsRecording(true);
      setCurrentTranscription(''); // Clear previous temp transcription
      toast({ title: 'Запись Начата', description: 'Говорите в микрофон...' });
    }
  };

  const handleDeleteNote = (id: string) => {
    setVoiceNotes(prev => prev.filter(note => note.id !== id));
    toast({ title: 'Заметка Удалена', description: 'Голосовая заметка удалена.' });
  };
  
  // Simulate real-time transcription for demo
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRecording) {
      const words = ["Это", "тестовая", "расшифровка", "в", "реальном", "времени.", "Просто", "для", "демонстрации."];
      let i = 0;
      intervalId = setInterval(() => {
        if (i < words.length) {
          setCurrentTranscription(prev => prev ? `${prev} ${words[i]}` : words[i]);
          i++;
        } else {
           // clearInterval(intervalId); // Let it repeat for demo
           i=0;
           setCurrentTranscription("");
        }
      }, 800);
    }
    return () => clearInterval(intervalId);
  }, [isRecording]);


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
          <Button
            size="lg"
            onClick={handleToggleRecording}
            disabled={processing}
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
          {(isRecording || currentTranscription) && (
            <Textarea
              placeholder="Здесь появится расшифровка вашей речи..."
              value={currentTranscription}
              readOnly={!isRecording} // Allow editing during "recording" for demo purposes
              onChange={(e) => isRecording && setCurrentTranscription(e.target.value)}
              rows={4}
              className="w-full bg-muted/50"
            />
          )}
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
                      <p className="text-sm whitespace-pre-line">{note.transcription}</p>
                      {/* Placeholder for audio playback */}
                      {/* note.audioUrl && <audio controls src={note.audioUrl} className="mt-2 w-full" /> */}
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
