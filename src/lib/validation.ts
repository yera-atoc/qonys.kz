import { z } from 'zod';

export const listingSchema = z.object({
  kind: z.enum(['OFFER_ROOM', 'SEEK_ROOMMATE']),
  title: z.string().min(10, 'Заголовок от 10 символов').max(120),
  description: z.string().min(40, 'Опишите жильё подробнее — минимум 40 символов').max(4000),
  price: z.coerce.number().int().min(5000, 'Минимум 5 000 ₸').max(3_000_000),
  deposit: z.coerce.number().int().min(0).default(0),
  housingType: z.enum(['SEPARATE_ROOM', 'SHARED_ROOM', 'BED_SPACE']),
  rooms: z.coerce.number().int().min(1).max(10),
  districtId: z.string().optional().nullable(),
  metro: z.string().max(60).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  preferGender: z.enum(['MALE', 'FEMALE']).optional().nullable(),
  minAge: z.coerce.number().int().min(16).max(90).optional().nullable(),
  maxAge: z.coerce.number().int().min(16).max(90).optional().nullable(),
  habits: z.array(z.string()).max(10).default([]),
  amenities: z.array(z.string()).max(15).default([])
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Как к вам обращаться?').max(60),
  phone: z.string().min(10, 'Введите номер телефона'),
  password: z.string().min(8, 'Пароль от 8 символов')
});

export const topUpSchema = z.object({
  amount: z.coerce.number().int().min(500, 'Минимальная сумма — 500 ₸').max(500_000)
});

export type ListingInput = z.infer<typeof listingSchema>;
