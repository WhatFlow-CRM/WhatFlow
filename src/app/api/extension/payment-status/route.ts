import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const whatsappNumber = searchParams.get('whatsappNumber');

    if (!whatsappNumber) {
      return NextResponse.json({ success: false, error: 'whatsappNumber is required' }, { headers: corsHeaders });
    }

    // Look up user by whatsappNumber first, then use user.id for ActivityLog query
    const user = await db.user.findUnique({
      where: { whatsappNumber },
    });

    if (!user) {
      return NextResponse.json({ hasPayment: false, latestPayment: null }, { headers: corsHeaders });
    }

    const latestLog = await db.activityLog.findFirst({
      where: {
        userId: user.id,
        action: { in: ['payment_submitted', 'payment_approved'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestLog) {
      return NextResponse.json({ hasPayment: false, latestPayment: null }, { headers: corsHeaders });
    }

    let details = {};
    try {
      details = latestLog.details ? JSON.parse(latestLog.details) : {};
    } catch {
      details = {};
    }

    return NextResponse.json({
      hasPayment: true,
      latestPayment: {
        id: latestLog.id,
        action: latestLog.action,
        status: latestLog.action === 'payment_approved' ? 'approved' : 'pending',
        ...details,
        createdAt: latestLog.createdAt,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json({ hasPayment: false }, { headers: corsHeaders });
  }
}
