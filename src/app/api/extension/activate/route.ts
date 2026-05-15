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

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + key.durationDays);

    // 2. Find existing user (if any) — to get previous plan type
    let previousPlanType: string | null = null;
    try {
      const existingUser = await db.user.findUnique({
        where: { whatsappNumber },
      });
      if (existingUser) {
        previousPlanType = existingUser.planType;
      }
    } catch { /* no existing user, that's fine */ }

    // 3. Clear any old key linked to this number (to avoid unique constraint violation on linkedNumber)
    try {
      await db.activationKey.updateMany({
        where: { linkedNumber: whatsappNumber },
        data: { linkedNumber: null },
      });
    } catch { /* no old keys, fine */ }

    // 4. Clear old currentKeyId on user if exists (to avoid unique constraint violation)
    try {
      await db.user.updateMany({
        where: { currentKeyId: { not: null } },
        data: { currentKeyId: null },
      }).catch(() => {});
    } catch { /* ignore */ }

    // 5. Create or update user — safe upsert
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
        lastPlanType: previousPlanType,
        planType: key.planType,
        isActive: true,
        currentKeyId: key.id,
        activatedAt: now,
        expiresAt,
      },
    });

    // 6. Update activation key
    await db.activationKey.update({
      where: { id: key.id },
      data: {
        status: 'active',
        linkedNumber: whatsappNumber,
        activatedAt: now,
        expiresAt,
      },
    });

    // 7. Get plan details
    let plan = null;
    try {
      plan = await db.plan.findUnique({
        where: { planType: key.planType },
      });
    } catch { /* plan lookup failed, use defaults */ }

    // 8. Create ActivityLog (non-critical — don't fail if this breaks)
    try {
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
    } catch { /* activity log is non-critical */ }

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
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: 'Activation failed: ' + errMsg },
      { status: 200, headers: corsHeaders }
    );
  }
}
