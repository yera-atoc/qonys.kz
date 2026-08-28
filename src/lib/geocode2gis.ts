// Геокодер 2ГИС — используется только на клиенте.
// Нужен для центрирования карты на городах, для которых у нас нет
// захардкоженных координат (см. src/lib/kzCities.ts), и для определения
// адреса по клику на карте в форме объявления.

const API_KEY = process.env.NEXT_PUBLIC_2GIS_API_KEY;

export type GeocodeResult = { lat: number; lng: number; address: string } | null;

export async function geocodeCity(cityName: string): Promise<GeocodeResult> {
  if (!API_KEY) return null;
  try {
    const url = new URL('https://catalog.api.2gis.com/3.0/items/geocode');
    url.searchParams.set('q', `Казахстан, ${cityName}`);
    url.searchParams.set('fields', 'items.point');
    url.searchParams.set('key', API_KEY);

    const res = await fetch(url.toString());
    const data = await res.json();
    const point = data?.result?.items?.[0]?.point;
    if (!point) return null;
    return { lat: point.lat, lng: point.lon, address: cityName };
  } catch {
    return null;
  }
}

// Обратный геокодинг: координаты -> человекочитаемый адрес (для формы объявления)
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!API_KEY) return null;
  try {
    const url = new URL('https://catalog.api.2gis.com/3.0/items/geocode');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('fields', 'items.address_name,items.full_name');
    url.searchParams.set('key', API_KEY);

    const res = await fetch(url.toString());
    const data = await res.json();
    const item = data?.result?.items?.[0];
    return item?.full_name ?? item?.address_name ?? null;
  } catch {
    return null;
  }
}
