import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const whatsappNumber = searchParams.get('whatsappNumber');

    if (!whatsappNumber) {
      return NextResponse.json({ error: 'whatsappNumber is required' }, { status: 400 });
    }

    const latestLog = await db.activityLog.findFirst({
      where: {
        userId: whatsappNumber,
        action: { in: ['payment_submitted', 'payment_approved'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestLog) {
      return NextResponse.json({ hasPayment: false, latestPayment: null });
    }

    const details = latestLog.details ? JSON.parse(latestLog.details) : {};

    return NextResponse.json({
      hasPayment: true,
      latestPayment: {
        id: latestLog.id,
        action: latestLog.action,
        status: latestLog.action === 'payment_approved' ? 'approved' : 'pending',
        ...details,
        createdAt: latestLog.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json({ hasPayment: false });
  }
}
