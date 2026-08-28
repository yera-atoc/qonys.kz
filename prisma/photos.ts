/**
 * Добавляет фотографии к демо-объявлениям.
 * Запуск: npx tsx prisma/photos.ts
 *
 * Ссылки ведут на Unsplash — замените их на реальные снимки квартир,
 * когда подключите загрузку фото.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PHOTOS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=70',
  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=900&q=70'
];

async function main() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: 'asc' },
    include: { photos: true }
  });

  let i = 0;
  for (const listing of listings) {
    if (listing.photos.length > 0) continue;

    // По три снимка на объявление, чтобы галерея не пустовала
    const picks = [PHOTOS[i % PHOTOS.length], PHOTOS[(i + 3) % PHOTOS.length], PHOTOS[(i + 5) % PHOTOS.length]];

    await prisma.listingPhoto.createMany({
      data: picks.map((url, sort) => ({ listingId: listing.id, url, sort }))
    });

    i++;
    console.log(`Фото добавлены: ${listing.title}`);
  }

  console.log(`Готово. Обработано объявлений: ${i}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
