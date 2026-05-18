import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * PUT /api/admin/upgrade
 * Upgrade a user from Basic to Advance plan using an activation key.
 *
 * Body: { whatsappNumber: string, advanceKey: string, durationDays?: number }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { whatsappNumber, advanceKey, durationDays } = body;

    // Validate required fields
    if (!whatsappNumber || !advanceKey) {
      return NextResponse.json(
        { success: false, error: 'whatsappNumber and advanceKey are required' }
      );
    }

    // 1. Validate the activation key
    const key = await db.activationKey.findUnique({
      where: { key: advanceKey.trim().toUpperCase() },
    });

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Invalid activation key. Please check and try again.' }
      );
    }

    if (key.status !== 'unused') {
      const statusMsg = key.status === 'active'
        ? 'This key has already been used and is active on another number.'
        : `This key has been ${key.status} and cannot be reused.`;
      return NextResponse.json(
        { success: false, error: statusMsg }
      );
    }

    // The key must be an Advance plan key
    if (key.planType !== 'Advance') {
      return NextResponse.json(
        { success: false, error: 'This activation key is not for the Advance plan.' }
      );
    }

    const days = durationDays ?? key.durationDays ?? 90;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + days);

    // 2. Find existing user to capture previous plan type
    let previousPlanType: string | null = null;
    try {
      const existingUser = await db.user.findUnique({
        where: { whatsappNumber },
      });
      if (existingUser) {
        previousPlanType = existingUser.planType;
      }
    } catch { /* no existing user, that's fine */ }

    // 3. Clear any old key linked to this number (to avoid unique constraint violation)
    try {
      await db.activationKey.updateMany({
        where: { linkedNumber: whatsappNumber },
        data: { linkedNumber: null },
      });
    } catch { /* no old keys, fine */ }

    // 4. Clear old currentKeyId for THIS user only
    try {
      if (previousPlanType !== null) {
        await db.user.update({
          where: { whatsappNumber },
          data: { currentKeyId: null },
        });
      }
    } catch { /* ignore */ }

    // 5. Create or update user — upsert
    const user = await db.user.upsert({
      where: { whatsappNumber },
      create: {
        whatsappNumber,
        planType: 'Advance',
        isActive: true,
        currentKeyId: key.id,
        activatedAt: now,
        expiresAt,
      },
      update: {
        lastPlanType: previousPlanType,
        planType: 'Advance',
        isActive: true,
        currentKeyId: key.id,
        activatedAt: now,
        expiresAt,
      },
    });

    // 6. Update the activation key status
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
        where: { planType: 'Advance' },
      });
    } catch { /* plan lookup failed, use defaults */ }

    // 8. Log activity (non-critical)
    try {
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'plan_upgraded',
          details: JSON.stringify({
            activationKey: key.key,
            previousPlan: previousPlanType,
            newPlan: 'Advance',
            durationDays: days,
          }),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        },
      });
    } catch { /* activity log is non-critical */ }

    return NextResponse.json({
      success: true,
      message: 'Upgraded to Advance plan successfully',
      user: {
        whatsappNumber: user.whatsappNumber,
        planType: user.planType,
        isActive: user.isActive,
        expiresAt: user.expiresAt,
      },
      plan: {
        planType: 'Advance',
        displayName: plan?.displayName || 'Advance',
        dailyMessageLimit: plan?.dailyMessageLimit ?? 5000,
        durationDays: days,
      },
    });
  } catch (error) {
    console.error('Error upgrading user:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Upgrade failed: ' + errMsg });
  }
}
