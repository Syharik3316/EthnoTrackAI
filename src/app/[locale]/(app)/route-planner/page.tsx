'use client';

import { useState, type FormEvent } from 'react';
import { Route as RouteIcon, Send, Loader2, MapPin, DollarSign, Milestone, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { REGIONS_KEYS, TRAVEL_STYLES_KEYS } from '@/lib/constants'; // Updated import
import { personalizedRouteRecommendations, type PersonalizedRouteRecommendationsInput, type PersonalizedRouteRecommendationsOutput } from '@/ai/flows/personalized-route-recommendations';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormData extends PersonalizedRouteRecommendationsInput {
  selectedRegions: string[];
}

export default function RoutePlannerPage() {
  const t = useTranslations('RoutePlannerPage');
  const tConstants = useTranslations(); // For constants like travel styles, regions

  const [formData, setFormData] = useState<FormData>({
    interests: '',
    travelStyle: TRAVEL_STYLES_KEYS.find(ts => ts.value === 'any')?.value || '',
    routeLengthPreference: '',
    regions: '',
    selectedRegions: [],
  });
  const [recommendation, setRecommendation] = useState<PersonalizedRouteRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Omit<FormData, 'selectedRegions'>, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleRegionChange = (regionKey: string, checked: boolean | 'indeterminate') => {
    setFormData((prev) => {
      // REGIONS_KEYS provides the original (non-translated) value for the AI
      const regionValue = REGIONS_KEYS.find(r => r.key === regionKey)?.value || regionKey;
      const newSelectedRegions = checked
        ? [...prev.selectedRegions, regionValue]
        : prev.selectedRegions.filter((r) => r !== regionValue);
      return { ...prev, selectedRegions: newSelectedRegions };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRecommendation(null);

    const inputForAI: PersonalizedRouteRecommendationsInput = {
      ...formData,
      regions: formData.selectedRegions.join(', '), // Send the original, non-translated region values
    };

    try {
      const result = await personalizedRouteRecommendations(inputForAI);
      setRecommendation(result);
      toast({
        title: t('routeGeneratedToastTitle'),
        description: t('routeGeneratedToastDescription'),
      });
    } catch (error) {
      console.error('Route Recommendation Error:', error);
      toast({
        title: t('plannerErrorToastTitle'),
        description: t('plannerErrorToastDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={RouteIcon}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>{t('travelParamsTitle')}</CardTitle>
            <CardDescription>{t('travelParamsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="interests">{t('interestsLabel')}</Label>
                <Input
                  id="interests"
                  name="interests"
                  placeholder={t('interestsPlaceholder')}
                  value={formData.interests}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="travelStyle">{t('travelStyleLabel')}</Label>
                <Select
                  name="travelStyle"
                  value={formData.travelStyle}
                  onValueChange={(value) => handleSelectChange('travelStyle', value)}
                >
                  <SelectTrigger id="travelStyle">
                    <SelectValue placeholder={t('travelStylePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVEL_STYLES_KEYS.map(style => (
                         <SelectItem key={style.value} value={style.value}>{tConstants(style.labelKey)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="routeLengthPreference">{t('routeLengthLabel')}</Label>
                <Input
                  id="routeLengthPreference"
                  name="routeLengthPreference"
                  placeholder={t('routeLengthPlaceholder')}
                  value={formData.routeLengthPreference}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>{t('regionsLabel')}</Label>
                <ScrollArea className="h-40 rounded-md border p-2">
                  <div className="space-y-2">
                  {REGIONS_KEYS.map((region) => (
                    <div key={region.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region-${region.key}`}
                        checked={formData.selectedRegions.includes(region.value)}
                        onCheckedChange={(checked) => handleRegionChange(region.key, checked)}
                      />
                      <Label htmlFor={`region-${region.key}`} className="font-normal cursor-pointer">{tConstants(region.labelKey)}</Label>
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
                {t('generateRouteButton')}
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
                <CardTitle>{t('yourRecommendedRouteTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <RouteIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('fillFormPrompt')}</p>
              </CardContent>
            </Card>
          )}
          {recommendation && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">{t('yourIndividualRouteTitle')}</CardTitle>
                <CardDescription>{t('aiCreatedPrompt')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center"><Info className="h-5 w-5 mr-2 text-primary"/>{t('routeDescriptionLabel')}</h3>
                  <p className="text-sm text-foreground/80 whitespace-pre-line">{recommendation.routeDescription}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center"><MapPin className="h-5 w-5 mr-2 text-primary"/>{t('attractionsLabel')}</h3>
                  <p className="text-sm text-foreground/80 whitespace-pre-line">{recommendation.attractions}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-accent" />
                        <div>
                            <p className="text-xs text-muted-foreground">{t('estimatedCostLabel')}</p>
                            <p className="font-medium">{recommendation.estimatedCost}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Milestone className="h-5 w-5 text-accent" />
                        <div>
                            <p className="text-xs text-muted-foreground">{t('estimatedDistanceLabel')}</p>
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
