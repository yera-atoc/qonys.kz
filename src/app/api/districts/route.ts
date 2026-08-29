import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const city = new URL(req.url).searchParams.get('city') ?? 'almaty';
  const districts = await prisma.district.findMany({
    where: { city },
    orderBy: { sort: 'asc' },
    select: { id: true, name: true, nameKk: true, nameEn: true }
  });
  return NextResponse.json({ districts });
}
