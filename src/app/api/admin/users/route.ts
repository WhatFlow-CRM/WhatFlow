import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const planType = searchParams.get('planType');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { whatsappNumber: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (planType) {
      where.planType = planType;
    }

    if (status !== null && status !== undefined) {
      where.isActive = status === 'active';
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: 'desc' },
      }),
      db.user.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    return NextResponse.json({ users, total });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ users: [], total: 0 });
  }
}
