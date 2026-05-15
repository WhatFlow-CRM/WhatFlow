import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { whatsappNumber, activationKey } = body;

    if (!whatsappNumber || !activationKey) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp number and activation key are required' },
        { status: 200, headers: corsHeaders }
      );
    }

    // 1. Find the activation key
    const key = await db.activationKey.findUnique({
      where: { key: activationKey.trim().toUpperCase() },
    });

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Invalid activation key. Please check and try again.' },
        { status: 200, headers: corsHeaders }
      );
    }

    if (key.status !== 'unused') {
      const statusMsg = key.status === 'active' 
        ? 'This key has already been used and is active on another number.' 
        : `This key has been ${key.status} and cannot be reused.`;
      return NextResponse.json(
        { success: false, error: statusMsg },
        { status: 200, headers: corsHeaders }
      );
    }

    // 2. Find existing user (if any)
    const existingUser = await db.user.findUnique({
      where: { whatsappNumber },
    });

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + key.durationDays);

    // 3. Create or update user
    const user = await db.user.upsert({
      where: { whatsappNumber },
      create: {
        whatsappNumber,
        planType: key.planType,
        isActive: true,
        currentKeyId: key.id,
        activatedAt: now,
        expiresAt,
      },
      update: {
        lastPlanType: existingUser ? existingUser.planType : null,
        planType: key.planType,
        isActive: true,
        currentKeyId: key.id,
        activatedAt: now,
        expiresAt,
      },
    });

    // 4. Update activation key
    await db.activationKey.update({
      where: { id: key.id },
      data: {
        status: 'active',
        linkedNumber: whatsappNumber,
        activatedAt: now,
        expiresAt,
      },
    });

    // 5. Get plan details
    const plan = await db.plan.findUnique({
      where: { planType: key.planType },
    });

    // 6. Create ActivityLog
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'key_activated',
        details: JSON.stringify({
          activationKey: key.key,
          planType: key.planType,
          durationDays: key.durationDays,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Key activated successfully',
      planType: key.planType,
      displayName: plan?.displayName || key.planType,
      dailyMessageLimit: plan?.dailyMessageLimit ?? 500,
      expiresAt,
      durationDays: key.durationDays,
    }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error activating key:', error);
    return NextResponse.json(
      { success: false, error: 'Service temporarily unavailable. Please try again later.' },
      { status: 200, headers: corsHeaders }
    );
  }
}
