'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, User, CornerDownLeft, Mic, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { aiGuideInteraction, type AiGuideInteractionInput } from '@/ai/flows/ai-guide-interaction';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

// Hardcoded Russian constants for rollback
const AI_AVATAR_OPTIONS_DATA = [
  { value: "human", label: "Человек" },
  { value: "robot", label: "Робот" },
  { value: "fairytale", label: "Сказочный герой" },
];


interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  avatar?: string;
}

export function AiGuideChat() {
  const aiGuideTitle = "AI Гид";
  const selectAvatarLabel = "Выберите Аватара:";
  const selectAvatarPlaceholder = "Выберите тип аватара";
  const userPreferencesLabel = "Ваши предпочтения (опционально):";
  const userPreferencesPlaceholder = "Например: люблю историю, предпочитаю вегетарианскую еду, интересуюсь активным отдыхом...";
  const thinkingMessage = "Гид думает...";
  const initialPrompt = "Задайте вопрос вашему AI Гиду!";
  const initialPromptExample = "Например: \"Какие интересные места есть в Ростовской области?\"";
  const sendMessagePlaceholder = "Спросите что-нибудь у гида...";
  const sendMessageAriaLabel = "Отправить сообщение AI Гиду";
  const voiceInputAriaLabel = "Голосовой ввод (не реализовано)";
  const errorToastTitle = "Ошибка";
  const errorToastDescription = "Пожалуйста, введите ваш вопрос.";
  const aiErrorToastTitle = "Ошибка AI Гида";
  const aiErrorToastDescription = "Не удалось получить ответ от гида. Пожалуйста, попробуйте позже.";
  const aiFallbackMessage = "Извините, я не смог обработать ваш запрос. Попробуйте еще раз.";


  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AI_AVATAR_OPTIONS_DATA[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState('');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() && messages.length === 0) {
        toast({ title: errorToastTitle, description: errorToastDescription, variant: "destructive"});
        return;
    }
    if (!input.trim() && messages.length > 0) {
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
        userPreferences: userPreferences || undefined,
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
        title: aiErrorToastTitle,
        description: aiErrorToastDescription,
        variant: 'destructive',
      });
       const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiFallbackMessage,
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
        return <Sparkles className="h-8 w-8 rounded-full text-green-500" />;
      case 'human':
      default:
        return <Bot className="h-8 w-8 rounded-full text-secondary-foreground" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          {aiGuideTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 space-y-2">
          <Label htmlFor="avatar-select">{selectAvatarLabel}</Label>
          <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
            <SelectTrigger id="avatar-select" className="w-full md:w-1/2">
              <SelectValue placeholder={selectAvatarPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {AI_AVATAR_OPTIONS_DATA.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
           <Label htmlFor="user-preferences">{userPreferencesLabel}</Label>
           <Textarea
            id="user-preferences"
            placeholder={userPreferencesPlaceholder}
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
                  {thinkingMessage}
                </div>
              </div>
            )}
             {messages.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground py-10">
                    <Sparkles className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <p>{initialPrompt}</p>
                    <p className="text-xs mt-1">{initialPromptExample}</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder={sendMessagePlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={isLoading}
            aria-label={sendMessageAriaLabel}
          />
          <Button type="submit" size="icon" disabled={isLoading} aria-label={sendMessageAriaLabel}>
            <CornerDownLeft className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="outline" disabled={isLoading} aria-label={voiceInputAriaLabel}>
            <Mic className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
