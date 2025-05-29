// src/components/yandex-map.tsx
'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

interface YandexMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
}

declare global {
  interface Window {
    ymaps: any; // Yandex Maps API object
  }
}

const YandexMap: React.FC<YandexMapProps> = ({
  center = [55.751574, 37.573856], // По умолчанию центр - Москва
  zoom = 9, // По умолчанию масштаб
  className = 'w-full h-[500px] rounded-lg border border-dashed bg-muted',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError("API ключ Яндекс Карт не найден. Пожалуйста, добавьте NEXT_PUBLIC_YANDEX_MAPS_API_KEY в ваш .env файл.");
      return;
    }
    setError(null); // Clear previous error if API key is found
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

    // Cleanup map instance on unmount
    return () => {
      if (mapInstance) {
        mapInstance.destroy();
        setMapInstance(null);
      }
    };
  }, [isApiLoaded, center, zoom, mapInstance, error]); // Added error to dependency array

  if (error) {
    return (
      <div className={className + " flex items-center justify-center"}>
        <p className="text-destructive-foreground bg-destructive p-4 rounded-md text-center">{error}</p>
      </div>
    );
  }

  return (
    <>
      {apiKey && ( // Only load script if API key exists
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
