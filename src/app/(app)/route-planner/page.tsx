'use client';

import { useState, type FormEvent } from 'react';
import { Route as RouteIcon, Send, Loader2, MapPin, DollarSign, Milestone, Info } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { REGIONS, TRAVEL_STYLES } from '@/lib/constants';
import { personalizedRouteRecommendations, type PersonalizedRouteRecommendationsInput, type PersonalizedRouteRecommendationsOutput } from '@/ai/flows/personalized-route-recommendations';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormData extends PersonalizedRouteRecommendationsInput {
  selectedRegions: string[];
}

export default function RoutePlannerPage() {
  const [formData, setFormData] = useState<FormData>({
    interests: '',
    travelStyle: TRAVEL_STYLES.find(ts => ts.value === 'any')?.value || '',
    routeLengthPreference: '',
    regions: '', // This will be populated from selectedRegions
    selectedRegions: [],
  });
  const [recommendation, setRecommendation] = useState<PersonalizedRouteRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleRegionChange = (region: string, checked: boolean | 'indeterminate') => {
    setFormData((prev) => {
      const newSelectedRegions = checked
        ? [...prev.selectedRegions, region]
        : prev.selectedRegions.filter((r) => r !== region);
      return { ...prev, selectedRegions: newSelectedRegions };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRecommendation(null);

    const inputForAI: PersonalizedRouteRecommendationsInput = {
      ...formData,
      regions: formData.selectedRegions.join(', '),
    };

    try {
      const result = await personalizedRouteRecommendations(inputForAI);
      setRecommendation(result);
      toast({
        title: 'Маршрут Сформирован!',
        description: 'Ваш персонализированный маршрут готов.',
      });
    } catch (error) {
      console.error('Route Recommendation Error:', error);
      toast({
        title: 'Ошибка Планировщика',
        description: 'Не удалось сгенерировать маршрут. Пожалуйста, проверьте введенные данные и попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Планировщик Маршрута"
        description="Создайте свой идеальный маршрут с помощью AI."
        icon={RouteIcon}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>Параметры Путешествия</CardTitle>
            <CardDescription>Заполните ваши предпочтения для построения маршрута.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="interests">Интересы</Label>
                <Input
                  id="interests"
                  name="interests"
                  placeholder="Например: история, природа, еда"
                  value={formData.interests}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="travelStyle">Стиль Путешествия</Label>
                <Select
                  name="travelStyle"
                  value={formData.travelStyle}
                  onValueChange={(value) => handleSelectChange('travelStyle', value)}
                >
                  <SelectTrigger id="travelStyle">
                    <SelectValue placeholder="Выберите стиль" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVEL_STYLES.map(style => (
                         <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="routeLengthPreference">Предпочтительная Длительность/Расстояние</Label>
                <Input
                  id="routeLengthPreference"
                  name="routeLengthPreference"
                  placeholder="Например: 7 дней, 500 км"
                  value={formData.routeLengthPreference}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Регионы для посещения</Label>
                <ScrollArea className="h-40 rounded-md border p-2">
                  <div className="space-y-2">
                  {REGIONS.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region-${region}`}
                        checked={formData.selectedRegions.includes(region)}
                        onCheckedChange={(checked) => handleRegionChange(region, checked)}
                      />
                      <Label htmlFor={`region-${region}`} className="font-normal cursor-pointer">{region}</Label>
                    </div>
                  ))}
                  </div>
                </ScrollArea>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Сформировать Маршрут
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          {isLoading && !recommendation && (
             <Card className="shadow-lg animate-pulse">
                <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-1"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-20 bg-muted rounded w-full mt-4"></div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                </CardFooter>
            </Card>
          )}
          {!isLoading && !recommendation && (
            <Card className="shadow-lg h-full flex flex-col items-center justify-center text-center">
              <CardHeader>
                <CardTitle>Ваш Рекомендованный Маршрут</CardTitle>
              </CardHeader>
              <CardContent>
                <RouteIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Заполните форму слева, и AI предложит вам персонализированный маршрут.</p>
              </CardContent>
            </Card>
          )}
          {recommendation && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Ваш Индивидуальный Маршрут</CardTitle>
                <CardDescription>Создано AI специально для вас.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center"><Info className="h-5 w-5 mr-2 text-primary"/>Описание Маршрута:</h3>
                  <p className="text-sm text-foreground/80 whitespace-pre-line">{recommendation.routeDescription}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center"><MapPin className="h-5 w-5 mr-2 text-primary"/>Достопримечательности:</h3>
                  <p className="text-sm text-foreground/80 whitespace-pre-line">{recommendation.attractions}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-accent" />
                        <div>
                            <p className="text-xs text-muted-foreground">Примерная Стоимость:</p>
                            <p className="font-medium">{recommendation.estimatedCost}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Milestone className="h-5 w-5 text-accent" />
                        <div>
                            <p className="text-xs text-muted-foreground">Примерное Расстояние:</p>
                            <p className="font-medium">{recommendation.estimatedDistance}</p>
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
