// src/components/yandex-map.tsx
'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

interface YandexMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  showParks?: boolean;
  showHotels?: boolean;
  showGasStations?: boolean;
  showElectricStations?: boolean;
}

declare global {
  interface Window {
    ymaps: any; // Yandex Maps API object
  }
}

interface PlacemarkCollection {
  parks: any[];
  hotels: any[];
  gasStations: any[];
  electricStations: any[];
  [key: string]: any[]; // Index signature
}

const YandexMap: React.FC<YandexMapProps> = ({
  center = [55.751574, 37.573856], // Default center - Moscow
  zoom = 9, // Default zoom
  className = 'w-full h-[500px] rounded-lg border border-dashed bg-muted',
  showParks,
  showHotels,
  showGasStations,
  showElectricStations,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const placemarksRef = useRef<PlacemarkCollection>({
    parks: [],
    hotels: [],
    gasStations: [],
    electricStations: [],
  });

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError("API ключ Яндекс Карт не найден. Пожалуйста, добавьте NEXT_PUBLIC_YANDEX_MAPS_API_KEY в ваш .env файл.");
      return;
    }
    setError(null);
  }, [apiKey]);

  useEffect(() => {
    if (isApiLoaded && window.ymaps && mapRef.current && !mapInstance && !error) {
      window.ymaps.ready(() => {
        try {
          const newMap = new window.ymaps.Map(mapRef.current!, {
            center: center,
            zoom: zoom,
            controls: ['zoomControl', 'fullscreenControl', 'geolocationControl', 'trafficControl', 'typeSelector']
          });
          setMapInstance(newMap);
        } catch (e) {
          console.error("Ошибка инициализации Яндекс Карты:", e);
          setError("Не удалось инициализировать карту. Пожалуйста, проверьте консоль для деталей.");
        }
      });
    }

    return () => {
      if (mapInstance) {
        mapInstance.destroy();
        setMapInstance(null);
      }
    };
  }, [isApiLoaded, center, zoom, error]); // Removed mapInstance from deps to avoid re-init

  const clearPlacemarks = (type: keyof PlacemarkCollection) => {
    if (mapInstance && placemarksRef.current[type]) {
      placemarksRef.current[type].forEach(pm => mapInstance.geoObjects.remove(pm));
      placemarksRef.current[type] = [];
    }
  };

  const searchAndDisplayPois = (
    type: keyof PlacemarkCollection, 
    query: string, 
    preset: string
  ) => {
    if (!mapInstance || !window.ymaps) return;
    clearPlacemarks(type);

    window.ymaps.geocode(query, {
      boundedBy: mapInstance.getBounds(),
      results: 20 // Limit results
    }).then((res: any) => {
      res.geoObjects.each((obj: any) => {
        const coords = obj.geometry.getCoordinates();
        const name = obj.properties.get('name');
        const description = obj.properties.get('description');
        // Try to get a URL from balloonContent if available
        const balloonContent = obj.properties.get('balloonContentBody') || '';
        let link = '';
        const linkMatch = balloonContent.match(/href="([^"]+)"/);
        if (linkMatch && linkMatch[1]) {
            link = linkMatch[1];
        }
        
        const placemark = new window.ymaps.Placemark(coords, {
          hintContent: name,
          balloonContentHeader: name,
          balloonContentBody: `
            <p>${description || 'Нет описания'}</p>
            ${link ? `<p><a href="${link}" target="_blank" rel="noopener noreferrer">Перейти на сайт</a></p>` : ''}
          `,
          balloonContentFooter: 'Информация предоставлена Яндекс Картами',
        }, { preset });
        
        mapInstance.geoObjects.add(placemark);
        placemarksRef.current[type].push(placemark);
      });
    }).catch((err: any) => {
      console.error(`Ошибка поиска ${query}:`, err);
    });
  };

  useEffect(() => {
    if (showParks) searchAndDisplayPois('parks', 'парк', 'islands#greenIcon');
    else clearPlacemarks('parks');
  }, [showParks, mapInstance]);

  useEffect(() => {
    if (showHotels) searchAndDisplayPois('hotels', 'гостиница', 'islands#blueHotelIcon');
    else clearPlacemarks('hotels');
  }, [showHotels, mapInstance]);

  useEffect(() => {
    if (showGasStations) searchAndDisplayPois('gasStations', 'АЗС', 'islands#redAutoIcon'); // Changed from orange to red for gas
    else clearPlacemarks('gasStations');
  }, [showGasStations, mapInstance]);

  useEffect(() => {
    if (showElectricStations) searchAndDisplayPois('electricStations', 'зарядная станция для электромобилей', 'islands#yellow 전기차Icon'); // Using a generic yellow, need a better preset if available
    else clearPlacemarks('electricStations');
  }, [showElectricStations, mapInstance]);


  if (error) {
    return (
      <div className={className + " flex items-center justify-center"}>
        <p className="text-destructive-foreground bg-destructive p-4 rounded-md text-center">{error}</p>
      </div>
    );
  }

  return (
    <>
      {apiKey && (
        <Script
          src={`https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`}
          strategy="lazyOnload"
          onLoad={() => setIsApiLoaded(true)}
          onError={(e) => {
            console.error('Ошибка загрузки скрипта Яндекс Карт:', e);
            setError("Не удалось загрузить API Яндекс Карт. Проверьте подключение к интернету или правильность API ключа.");
            setIsApiLoaded(false);
          }}
        />
      )}
      <div ref={mapRef} className={className} aria-label="Интерактивная Яндекс Карта">
        {!isApiLoaded && !mapInstance && !error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Загрузка карты...</p>
          </div>
        )}
      </div>
    </>
  );
};

export default YandexMap;
