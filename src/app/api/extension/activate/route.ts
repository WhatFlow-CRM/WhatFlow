import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { whatsappNumber, activationKey } = body;

    if (!whatsappNumber || !activationKey) {
      return NextResponse.json(
        { error: 'whatsappNumber and activationKey are required' },
        { status: 400 }
      );
    }

    // 1. Find the activation key
    const key = await db.activationKey.findUnique({
      where: { key: activationKey.trim().toUpperCase() },
    });

    if (!key) {
      return NextResponse.json({ error: 'Invalid activation key' }, { status: 404 });
    }

    if (key.status !== 'unused') {
      return NextResponse.json(
        { error: `Activation key is already ${key.status}` },
        { status: 400 }
      );
    }

    // 2. Find or create user
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + key.durationDays);

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
        lastPlanType: { /* keep previous if exists */ },
      },
    });

    // If user existed, update their fields
    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: {
          lastPlanType: user.planType,
          planType: key.planType,
          isActive: true,
          currentKeyId: key.id,
          activatedAt: now,
          expiresAt,
        },
      });
    }

    // 3. Update activation key
    await db.activationKey.update({
      where: { id: key.id },
      data: {
        status: 'active',
        linkedNumber: whatsappNumber,
        activatedAt: now,
        expiresAt,
      },
    });

    // 4. Get plan details
    const plan = await db.plan.findUnique({
      where: { planType: key.planType },
    });

    // 5. Create ActivityLog
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
    });
  } catch (error) {
    console.error('Error activating key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
