'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const HABITS = ['не курю', 'курю на балконе', 'без животных', 'есть кот', 'тихий режим', 'ранние подъёмы', 'готовлю дома', 'без гостей'];
const AMENITIES = ['wi-fi', 'стиральная машина', 'мебель', 'кондиционер', 'посудомойка', 'парковка', 'лифт', 'своя ванная'];

export function ListingForm({
  districts,
  initial
}: {
  districts: { id: string; name: string }[];
  initial?: any;
}) {
  const router = useRouter();
  const [habits, setHabits] = useState<string[]>(initial?.habits ?? []);
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    const res = await fetch(initial ? `/api/listings/${initial.id}` : '/api/listings', {
      method: initial ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, habits, amenities })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Проверьте поля формы');
      return;
    }
    router.push('/cabinet/listings');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="label">Что вы публикуете</label>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['OFFER_ROOM', 'Сдаю комнату', 'У меня есть свободная комната или койко-место'],
            ['SEEK_ROOMMATE', 'Ищу соседа', 'Квартира снята, нужен человек делить аренду']
          ].map(([value, title, hint]) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="kind"
                value={value}
                defaultChecked={(initial?.kind ?? 'OFFER_ROOM') === value}
                className="peer sr-only"
              />
              <div className="rounded-xl border border-line p-4 transition peer-checked:border-brand peer-checked:bg-brand-soft">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-xs text-muted">{hint}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="title">Заголовок</label>
        <input
          id="title" name="title" className="field" required minLength={10} maxLength={120}
          defaultValue={initial?.title}
          placeholder="Отдельная комната в 2-комн., тихий двор"
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Описание</label>
        <textarea
          id="description" name="description" className="field min-h-[140px]" required minLength={40}
          defaultValue={initial?.description}
          placeholder="Что входит в цену, как делится коммуналка, кто уже живёт, когда можно заехать."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="price">Цена в месяц, ₸</label>
          <input id="price" name="price" type="number" className="field" required min={5000} defaultValue={initial?.price} />
        </div>
        <div>
          <label className="label" htmlFor="deposit">Залог, ₸</label>
          <input id="deposit" name="deposit" type="number" className="field" min={0} defaultValue={initial?.deposit ?? 0} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="housingType">Тип жилья</label>
          <select id="housingType" name="housingType" className="field" defaultValue={initial?.housingType ?? 'SEPARATE_ROOM'}>
            <option value="SEPARATE_ROOM">Отдельная комната</option>
            <option value="SHARED_ROOM">Делить комнату</option>
            <option value="BED_SPACE">Койко-место</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rooms">Комнат в квартире</label>
          <input id="rooms" name="rooms" type="number" className="field" min={1} max={10} defaultValue={initial?.rooms ?? 2} />
        </div>
        <div>
          <label className="label" htmlFor="preferGender">Пол соседа</label>
          <select id="preferGender" name="preferGender" className="field" defaultValue={initial?.preferGender ?? ''}>
            <option value="">Не важно</option>
            <option value="FEMALE">Женский</option>
            <option value="MALE">Мужской</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="districtId">Район</label>
          <select id="districtId" name="districtId" className="field" defaultValue={initial?.districtId ?? ''}>
            <option value="">Выберите район</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="metro">Ближайшее метро</label>
          <input id="metro" name="metro" className="field" placeholder="Алатау" defaultValue={initial?.metro ?? ''} />
        </div>
      </div>

      <Chips title="Привычки и правила" options={HABITS} selected={habits} onToggle={(v) => toggle(habits, setHabits, v)} />
      <Chips title="Что есть в квартире" options={AMENITIES} selected={amenities} onToggle={(v) => toggle(amenities, setAmenities, v)} />

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Отправляем…' : initial ? 'Сохранить изменения' : 'Отправить на проверку'}
        </button>
        <p className="text-xs text-muted">Модератор проверяет объявления в течение суток</p>
      </div>
    </form>
  );
}

function Chips({
  title, options, selected, onToggle
}: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <label className="label">{title}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              selected.includes(o) ? 'border-brand bg-brand text-white' : 'border-line bg-card text-muted hover:text-ink'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
