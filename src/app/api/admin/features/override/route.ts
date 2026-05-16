import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, featureKey, isEnabled } = body;

    if (!userId || !featureKey) {
      return NextResponse.json(
        { success: false, error: 'userId and featureKey are required' }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' });
    }

    // Verify feature exists
    const feature = await db.feature.findUnique({ where: { featureKey } });
    if (!feature) {
      return NextResponse.json({ success: false, error: 'Feature not found' });
    }

    // Upsert feature override
    const override = await db.featureOverride.upsert({
      where: {
        userId_featureKey: { userId, featureKey },
      },
      create: {
        userId,
        featureKey,
        isEnabled: isEnabled ?? true,
      },
      update: {
        isEnabled: isEnabled ?? true,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        action: 'feature_override',
        details: JSON.stringify({
          featureKey,
          isEnabled: isEnabled ?? true,
          overriddenBy: 'admin',
        }),
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          null,
      },
    });

    return NextResponse.json({ override });
  } catch (error) {
    console.error('Error setting feature override:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to set feature override: ' + errMsg });
  }
}
