export interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  /** Название страны, напр. "Cyprus" */
  country?: string;
  /** ISO-3166 alpha-2 код страны, напр. "CY" */
  countryCode?: string;
}

/** Источник IP-геолокации: запрос + нормализация ответа в GeoLocation */
interface GeoProvider {
  url: string;
  parse: (data: Record<string, unknown>) => GeoLocation | null;
}

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : null;
};

const GEO_PROVIDERS: GeoProvider[] = [
  {
    // https, CORS, без ключа
    url: 'https://get.geojs.io/v1/ip/geo.json',
    parse: (d) => {
      const lat = num(d.latitude);
      const lon = num(d.longitude);
      if (lat == null || lon == null) return null;
      return {
        latitude: lat,
        longitude: lon,
        city: d.city as string | undefined,
        region: d.region as string | undefined,
        country: d.country as string | undefined,
        countryCode: d.country_code as string | undefined,
      };
    },
  },
  {
    // запасной: https, CORS, без ключа
    url: 'https://freeipapi.com/api/json',
    parse: (d) => {
      const lat = num(d.latitude);
      const lon = num(d.longitude);
      if (lat == null || lon == null) return null;
      return {
        latitude: lat,
        longitude: lon,
        city: d.cityName as string | undefined,
        region: d.regionName as string | undefined,
        country: d.countryName as string | undefined,
        countryCode: d.countryCode as string | undefined,
      };
    },
  },
];

/**
 * Геолокация по IP-адресу (чувствительна к VPN, в отличие от
 * `navigator.geolocation`, который определяет позицию устройства по GPS/Wi-Fi).
 * Перебирает несколько бесплатных провайдеров (https, без ключа) с фолбэком.
 */
export const getGeolocation = async (): Promise<GeoLocation> => {
  for (const provider of GEO_PROVIDERS) {
    try {
      const res = await fetch(provider.url);
      if (!res.ok) continue;
      const data = await res.json();
      const parsed = provider.parse(data);
      if (parsed) return parsed;
    } catch {
      // пробуем следующий источник
    }
  }
  throw new Error('ip geolocation failed: все источники недоступны');
};

/**
 * Определение города по координатам через DaData (обратное геокодирование).
 */
export const getCityByLatAndLon = async ({
  lat,
  lon,
}: {
  lat: number;
  lon: number;
}) => {
  if (!lat || !lon) return '';

  const url =
    'https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address';
  const options: RequestInit = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Token ${process.env.NEXT_PUBLIC_DADATA_PUBLIC_KEY}`,
    },
    body: JSON.stringify({ lat, lon }),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) return '';
    const data = await response.json();
    return data?.suggestions?.[0]?.data?.city ?? '';
  } catch (error) {
    console.error('Ошибка при получении города от DaData:', error);
    return '';
  }
};
