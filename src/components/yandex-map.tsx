// src/components/yandex-map.tsx
'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

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
    ymaps: any; 
  }
}

interface PlacemarkCollection {
  parks: any[];
  hotels: any[];
  gasStations: any[];
  electricStations: any[];
  [key: string]: any[];
}

const YandexMap: React.FC<YandexMapProps> = ({
  center = [55.751574, 37.573856],
  zoom = 9,
  className = 'w-full h-[500px] rounded-lg border border-dashed bg-muted',
  showParks,
  showHotels,
  showGasStations,
  showElectricStations,
}) => {
  const t = useTranslations('YandexMap');
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
      setError(t('apiKeyMissingError'));
      return;
    }
    setError(null);
  }, [apiKey, t]);

  useEffect(() => {
    if (isApiLoaded && mapRef.current && !mapInstance && !error) {
      if (typeof window.ymaps === 'undefined' || typeof window.ymaps.ready === 'undefined') {
        setError(t('apiObjectError'));
        console.error("Yandex Maps API script loaded, but window.ymaps or window.ymaps.ready is undefined. This might be due to an invalid API key or network issues.");
        return;
      }
      window.ymaps.ready(() => {
        try {
          const newMap = new window.ymaps.Map(mapRef.current!, {
            center: center,
            zoom: zoom,
            controls: ['zoomControl', 'fullscreenControl', 'geolocationControl', 'trafficControl', 'typeSelector']
          });
          setMapInstance(newMap);
        } catch (e) {
          console.error("Error initializing Yandex Map:", e);
          setError(t('initError'));
        }
      });
    }

    return () => {
      if (mapInstance) {
        mapInstance.destroy();
        setMapInstance(null);
      }
    };
  }, [isApiLoaded, center, zoom, error, t]);

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
    if (!mapInstance || !window.ymaps || !window.ymaps.geocode) { 
        console.warn("Map or geocoding API not ready for POI search:", type);
        return;
    }
    clearPlacemarks(type);

    window.ymaps.geocode(query, {
      boundedBy: mapInstance.getBounds(),
      results: 50
    }).then((res: any) => {
      res.geoObjects.each((obj: any) => {
        const coords = obj.geometry.getCoordinates();
        const name = obj.properties.get('name') || t('noName');
        const description = obj.properties.get('description') || t('noDescription');
        
        const balloonContentBody = obj.properties.get('balloonContentBody') || '';
        let link = '';
        const linkMatch = balloonContentBody.match(/href="([^"]+)"/);
        if (linkMatch && linkMatch[1]) {
            link = linkMatch[1];
        }
        
        const placemark = new window.ymaps.Placemark(coords, {
          hintContent: name,
          balloonContentHeader: name,
          balloonContentBody: `
            <p>${description}</p>
            ${link ? `<p><a href="${link}" target="_blank" rel="noopener noreferrer">${t('balloonLinkText')}</a></p>` : ''}
          `,
          balloonContentFooter: t('balloonFooter'),
        }, { preset });
        
        mapInstance.geoObjects.add(placemark);
        placemarksRef.current[type].push(placemark);
      });
    }).catch((err: any) => {
      console.error(t('poiSearchError', { query, type }), err);
    });
  };

  useEffect(() => {
    if (mapInstance && showParks) searchAndDisplayPois('parks', 'парк', 'islands#greenIcon');
    else clearPlacemarks('parks');
  }, [showParks, mapInstance]);

  useEffect(() => {
    if (mapInstance && showHotels) searchAndDisplayPois('hotels', 'гостиница', 'islands#blueHotelIcon');
    else clearPlacemarks('hotels');
  }, [showHotels, mapInstance]);

  useEffect(() => {
    if (mapInstance && showGasStations) searchAndDisplayPois('gasStations', 'АЗС', 'islands#blueFuelStationIcon'); 
    else clearPlacemarks('gasStations');
  }, [showGasStations, mapInstance]);

  useEffect(() => {
    if (mapInstance && showElectricStations) searchAndDisplayPois('electricStations', 'зарядная станция для электромобилей', 'islands#yellowDotIcon'); 
    else clearPlacemarks('electricStations');
  }, [showElectricStations, mapInstance]);


  if (error) {
    return (
      <div className={className + " flex items-center justify-center p-4"}>
        <p className="text-destructive-foreground bg-destructive p-4 rounded-md text-center text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      {apiKey && (
        <Script
          src={`https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`}
          strategy="lazyOnload"
          onLoad={() => {
            console.log("Yandex Maps API script loaded successfully.");
            setIsApiLoaded(true);
            setError(null); 
          }}
          onError={(e) => {
            console.error('Error loading Yandex Maps script:', e);
            setError(t('initError')); // More generic error from translations
            setIsApiLoaded(false);
          }}
        />
      )}
      <div ref={mapRef} className={className} aria-label={t('mapAriaLabel')}>
        {!isApiLoaded && !mapInstance && !error && !apiKey && (
           <div className="flex items-center justify-center h-full p-4">
            <p className="text-muted-foreground text-center">{t('apiKeyNotSpecified')}</p>
          </div>
        )}
        {!isApiLoaded && !mapInstance && !error && apiKey && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">{t('loadingMessage')}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default YandexMap;
