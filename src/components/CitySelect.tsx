'use client';

import { KZ_CITIES } from '@/lib/kzCities';
import { useI18n } from './I18nProvider';

/**
 * Селектор города. Четыре города — плоский список без optgroup:
 * группировка по областям имела смысл при 90 пунктах, теперь она только шумит.
 */
export function CitySelect({
  id,
  name,
  value,
  onChange,
  disabled
}: {
  id: string;
  name?: string;
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
}) {
  const { locale } = useI18n();

  return (
    <select
      id={id}
      name={name}
      className="field"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {KZ_CITIES.map((c) => (
        <option key={c.slug} value={c.slug}>
          {c[locale]}
        </option>
      ))}
    </select>
  );
}
