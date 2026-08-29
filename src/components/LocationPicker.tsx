'use client';

import { useEffect, useRef, useState } from 'react';
import { reverseGeocode } from '@/lib/geocode2gis';
import { KZ_DEFAULT_CENTER, getKzCity } from '@/lib/kzCities';

const API_KEY = process.env.NEXT_PUBLIC_2GIS_API_KEY;
const SCRIPT_SRC = 'https://mapgl.2gis.com/api/js/v1';

declare global {
  interface Window {
    mapgl?: any;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadMapgl(): Promise<void> {
  if (window.mapgl) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('mapgl failed to load'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

type Props = {
  citySlug: string;
  lat: number | null;
  lng: number | null;
  onChange: (v: { lat: number; lng: number; address: string | null }) => void;
};

export function LocationPicker({ citySlug, lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');

  useEffect(() => {
    if (!API_KEY || !containerRef.current) return;
    let cancelled = false;
    setStatus('loading');

    (async () => {
      try {
        await loadMapgl();
        if (cancelled || !containerRef.current) return;

        const known = getKzCity(citySlug);
        const center: [number, number] =
          lng != null && lat != null ? [lng, lat] : known ? [known.lng, known.lat] : KZ_DEFAULT_CENTER;

        const map = new window.mapgl.Map(containerRef.current, { center, zoom: 13, key: API_KEY });
        mapRef.current = map;

        if (lat != null && lng != null) {
          markerRef.current = new window.mapgl.Marker(map, { coordinates: [lng, lat] });
        }

        map.on('click', async (e: any) => {
          const [clickLng, clickLat] = e.lngLat;
          markerRef.current?.destroy();
          markerRef.current = new window.mapgl.Marker(map, { coordinates: [clickLng, clickLat] });
          const address = await reverseGeocode(clickLat, clickLng);
          onChange({ lat: clickLat, lng: clickLng, address });
        });

        setStatus('ready');
      } catch {
        setStatus('failed');
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
    // Карта пересоздаётся при смене города, чтобы центрироваться на нём заново
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citySlug]);

  if (!API_KEY) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-subtle p-5 text-[14px] text-muted">
        Карта выбора адреса отключена — добавьте <code className="rounded bg-white px-1.5 py-0.5">NEXT_PUBLIC_2GIS_API_KEY</code> в
        переменные окружения, чтобы соседи могли увидеть объявление на карте.
      </div>
    );
  }

  return (
    <div>
      <div className="h-[320px] overflow-hidden rounded-2xl border border-line">
        <div ref={containerRef} className="h-full w-full" />
      </div>
      <p className="mt-2 text-[13px] text-muted">
        {lat != null && lng != null
          ? 'Точка сохранена. Кликните ещё раз, чтобы изменить.'
          : status === 'ready'
            ? 'Кликните на карте, чтобы отметить дом — это необязательно, но объявление появится на карте.'
            : 'Загрузка карты…'}
      </p>
    </div>
  );
}
