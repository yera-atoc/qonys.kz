'use client';

import { useState } from 'react';

export function Gallery({ photos }: { photos: string[] }) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-subtle">
        <div className="text-center">
          <svg viewBox="0 0 48 48" className="mx-auto h-12 w-12 text-line" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 20 24 8l16 12v18a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" strokeLinejoin="round" />
            <path d="M20 40V28h8v12" strokeLinejoin="round" />
          </svg>
          <p className="mt-3 text-[14px] text-muted">Автор не добавил фотографии</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[active]} alt="" className="h-full w-full object-cover" />
      </div>

      {photos.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {photos.map((url, i) => (
            <button
              key={url + i}
              onClick={() => setActive(i)}
              className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl transition ${
                i === active ? 'ring-2 ring-ink ring-offset-2' : 'opacity-70 hover:opacity-100'
              }`}
              aria-label={`Фото ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
