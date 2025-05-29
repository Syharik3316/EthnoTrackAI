// src/app/(app)/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { Map as MapIcon, Compass, Trees, Hotel, Fuel, Zap } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import YandexMap from '@/components/yandex-map';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const [showParks, setShowParks] = useState(false);
  const [showHotels, setShowHotels] = useState(false);
  const [showGasStations, setShowGasStations] = useState(false);
  const [showElectricStations, setShowElectricStations] = useState(false);

  // Координаты Ростова-на-Дону
  const rostovOnDonCenter: [number, number] = [47.2333, 39.7000];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Интерактивная Карта"
        description="Исследуйте культурные маршруты и находите интересные места."
        icon={MapIcon}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3 shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-6 w-6 text-primary" />
                  Карта Маршрутов
                </CardTitle>
                <CardDescription>
                  Интерактивная карта для исследования маршрутов и достопримечательностей.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 items-center border p-3 rounded-md bg-muted/50">
                <Label className="font-semibold text-sm">Показать на карте:</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="showParks" checked={showParks} onCheckedChange={(checked) => setShowParks(!!checked)} />
                  <Label htmlFor="showParks" className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
                    <Trees className="h-4 w-4 text-green-600" /> Парки
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="showHotels" checked={showHotels} onCheckedChange={(checked) => setShowHotels(!!checked)} />
                  <Label htmlFor="showHotels" className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
                    <Hotel className="h-4 w-4 text-blue-600" /> Отели
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="showGasStations" checked={showGasStations} onCheckedChange={(checked) => setShowGasStations(!!checked)} />
                  <Label htmlFor="showGasStations" className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
                    <Fuel className="h-4 w-4 text-orange-600" /> АЗС
                  </Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="showElectricStations" checked={showElectricStations} onCheckedChange={(checked) => setShowElectricStations(!!checked)} />
                  <Label htmlFor="showElectricStations" className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" /> Электрозарядки
                  </Label>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <YandexMap 
              center={rostovOnDonCenter} // Используем координаты Ростова-на-Дону
              zoom={10} // Можно настроить подходящий масштаб для Ростова
              showParks={showParks}
              showHotels={showHotels}
              showGasStations={showGasStations}
              showElectricStations={showElectricStations}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
