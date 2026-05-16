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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      whatsappNumber,
      paymentMethod,
      transactionId,
      amount,
      currency,
      planType,
      planDuration,
      proofImage,
    } = body;

    if (!whatsappNumber || !paymentMethod || !amount || !planType || !proofImage) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: whatsappNumber, paymentMethod, amount, planType, proofImage',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find or create user
    await db.user.upsert({
      where: { whatsappNumber },
      create: { whatsappNumber },
      update: {},
    });

    // Create activity log for payment proof submission (legacy compat)
    const user = await db.user.findUnique({ where: { whatsappNumber } });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create or retrieve user record' }
      );
    }

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'payment_submitted',
        details: JSON.stringify({
          paymentMethod,
          transactionId: transactionId || null,
          amount: parseFloat(amount),
          currency: currency || 'PKR',
          planType,
          planDuration: planDuration || 'Monthly',
          proofImage,
        }),
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          null,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Payment proof submitted successfully' },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error submitting payment proof:', error);
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503, headers: corsHeaders });
  }
}
