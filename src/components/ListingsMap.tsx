'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { tenge } from '@/lib/format';

import { KZ_DEFAULT_CENTER, getKzCity } from '@/lib/kzCities';

const API_KEY = process.env.NEXT_PUBLIC_2GIS_API_KEY;
const SCRIPT_SRC = 'https://mapgl.2gis.com/api/js/v1';

export type MapListing = {
  id: string;
  title: string;
  price: number;
  kind: 'OFFER_ROOM' | 'SEEK_ROOMMATE';
  lat: number | null;
  lng: number | null;
};

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

export function ListingsMap({ listings, citySlug }: { listings: MapListing[]; citySlug: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const pins = listings.filter((l) => l.lat != null && l.lng != null);

  // Инициализация карты один раз
  useEffect(() => {
    if (!API_KEY || !containerRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        await loadMapgl();
        if (cancelled || !containerRef.current) return;

        // Все открытые города имеют координаты в справочнике, поэтому
        // геокодер для центра карты больше не нужен: минус сетевой запрос
        // и минус мигание карты на первом кадре.
        const known = getKzCity(citySlug);
        const center: [number, number] = known ? [known.lng, known.lat] : KZ_DEFAULT_CENTER;

        const map = new window.mapgl.Map(containerRef.current, {
          center,
          zoom: pins.length ? 12 : (known?.zoom ?? 11),
          key: API_KEY
        });
        mapRef.current = map;
        setReady(true);
      } catch {
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citySlug]);

  // Перерисовка меток при смене выборки объявлений
  useEffect(() => {
    if (!ready || !mapRef.current || !window.mapgl) return;

    markersRef.current.forEach((m) => m.destroy());
    markersRef.current = [];

    pins.forEach((listing) => {
      const el = document.createElement('div');
      el.className =
        listing.kind === 'OFFER_ROOM'
          ? 'rounded-full bg-mint-ink px-3 py-1.5 text-[13px] font-bold text-white shadow-pop whitespace-nowrap cursor-pointer'
          : 'rounded-full bg-ink px-3 py-1.5 text-[13px] font-bold text-white shadow-pop whitespace-nowrap cursor-pointer';
      el.textContent = tenge(listing.price);
      el.onclick = () => window.open(`/listing/${listing.id}`, '_self');

      const marker = new window.mapgl.HtmlMarker(mapRef.current, {
        coordinates: [listing.lng, listing.lat],
        html: el,
        anchor: [0, 0.5] as any
      });
      markersRef.current.push(marker);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, listings]);

  if (!API_KEY) {
    return (
      <div className="grid h-[520px] place-items-center rounded-2xl border border-dashed border-line bg-subtle px-8 text-center">
        <div>
          <p className="font-display text-[18px] font-bold tracking-tight">Карта не подключена</p>
          <p className="mt-2 max-w-sm text-[14px] text-muted">
            Получите бесплатный ключ на dev.2gis.com и добавьте его в переменную окружения
            <code className="mx-1 rounded bg-white px-1.5 py-0.5 text-[13px]">NEXT_PUBLIC_2GIS_API_KEY</code>.
          </p>
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="grid h-[520px] place-items-center rounded-2xl border border-line bg-subtle text-[14px] text-muted">
        Не удалось загрузить карту. Проверьте соединение и ключ API.
      </div>
    );
  }

  return (
    <div className="relative h-[520px] overflow-hidden rounded-2xl border border-line shadow-card">
      <div ref={containerRef} className="h-full w-full" />
      {pins.length === 0 && ready && (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
          <span className="pill bg-white shadow-pop">В этом городе пока нет объявлений с адресом на карте</span>
        </div>
      )}
    </div>
  );
}
