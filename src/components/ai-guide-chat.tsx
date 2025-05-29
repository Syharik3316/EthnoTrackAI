'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, User, CornerDownLeft, Mic, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AI_AVATAR_OPTIONS } from '@/lib/constants';
import { aiGuideInteraction, type AiGuideInteractionInput } from '@/ai/flows/ai-guide-interaction';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  avatar?: string;
}

export function AiGuideChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AI_AVATAR_OPTIONS[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState(''); // Add state for user preferences
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() && messages.length === 0) { // Prevent sending empty initial message
        toast({ title: "Ошибка", description: "Пожалуйста, введите ваш вопрос.", variant: "destructive"});
        return;
    }
    if (!input.trim() && messages.length > 0) { // Allow empty input if continuing conversation, but don't send
        return;
    }


    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiInput: AiGuideInteractionInput = {
        question: input,
        userPreferences: userPreferences || undefined, // Include user preferences
      };
      const response = await aiGuideInteraction(aiInput);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        sender: 'ai',
        avatar: selectedAvatar,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Guide Interaction Error:', error);
      toast({
        title: 'Ошибка AI Гида',
        description: 'Не удалось получить ответ от гида. Пожалуйста, попробуйте позже.',
        variant: 'destructive',
      });
      // Optionally add the error message back to input or a system message
       const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Извините, я не смог обработать ваш запрос. Попробуйте еще раз.",
        sender: 'ai',
        avatar: selectedAvatar,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarIcon = (sender: 'user' | 'ai', avatarType?: string) => {
    if (sender === 'user') return <User className="h-8 w-8 rounded-full text-primary" />;
    switch (avatarType) {
      case 'robot':
        return <Bot className="h-8 w-8 rounded-full text-accent" />;
      case 'fairytale':
        return <Sparkles className="h-8 w-8 rounded-full text-green-500" />; // Placeholder for fairytale
      case 'human':
      default:
        return <Bot className="h-8 w-8 rounded-full text-secondary-foreground" />; // Default AI avatar
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Гид
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 space-y-2">
          <Label htmlFor="avatar-select">Выберите Аватара:</Label>
          <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
            <SelectTrigger id="avatar-select" className="w-full md:w-1/2">
              <SelectValue placeholder="Выберите тип аватара" />
            </SelectTrigger>
            <SelectContent>
              {AI_AVATAR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
           <Label htmlFor="user-preferences">Ваши предпочтения (опционально):</Label>
           <Textarea
            id="user-preferences"
            placeholder="Например: люблю историю, предпочитаю вегетарианскую еду, интересуюсь активным отдыхом..."
            value={userPreferences}
            onChange={(e) => setUserPreferences(e.target.value)}
            className="min-h-[60px]"
          />
        </div>

        <ScrollArea className="h-[400px] w-full p-4 border-t" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && getAvatarIcon(message.sender, message.avatar)}
                <div
                  className={`max-w-[70%] rounded-lg p-3 text-sm shadow ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {message.text}
                </div>
                {message.sender === 'user' && getAvatarIcon(message.sender)}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                {getAvatarIcon('ai', selectedAvatar)}
                <div className="max-w-[70%] rounded-lg p-3 text-sm shadow bg-muted text-muted-foreground animate-pulse">
                  Гид думает...
                </div>
              </div>
            )}
             {messages.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground py-10">
                    <Sparkles className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <p>Задайте вопрос вашему AI Гиду!</p>
                    <p className="text-xs mt-1">Например: "Какие интересные места есть в Ростовской области?"</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Спросите что-нибудь у гида..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={isLoading}
            aria-label="Сообщение для AI Гида"
          />
          <Button type="submit" size="icon" disabled={isLoading} aria-label="Отправить сообщение">
            <CornerDownLeft className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="outline" disabled={isLoading} aria-label="Голосовой ввод (не реализовано)">
            <Mic className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
