import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
        { status: 400 }
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
    await db.activityLog.create({
      data: {
        userId: user?.id || whatsappNumber,
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
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting payment proof:', error);
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }
}
