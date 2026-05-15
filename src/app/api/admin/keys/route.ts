import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { linkedNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [keys, total] = await Promise.all([
      db.activationKey.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: 'desc' },
      }),
      db.activationKey.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    return NextResponse.json({ keys, total });
  } catch (error) {
    console.error('Error fetching activation keys:', error);
    return NextResponse.json({ keys: [], total: 0 });
  }
}
