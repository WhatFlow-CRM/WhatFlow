import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, featureKey, isEnabled } = body;

    if (!planType || !featureKey) {
      return NextResponse.json(
        { success: false, error: 'planType and featureKey are required' }
      );
    }

    // Verify plan exists
    const plan = await db.plan.findUnique({ where: { planType } });
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plan not found' });
    }

    // Verify feature exists
    const feature = await db.feature.findUnique({ where: { featureKey } });
    if (!feature) {
      return NextResponse.json({ success: false, error: 'Feature not found' });
    }

    // Upsert plan-feature access
    const access = await db.planFeatureAccess.upsert({
      where: {
        planType_featureKey: { planType, featureKey },
      },
      create: {
        planType,
        featureKey,
        isEnabled: isEnabled ?? false,
      },
      update: {
        isEnabled: isEnabled ?? false,
      },
    });

    return NextResponse.json({ access });
  } catch (error) {
    console.error('Error updating plan-feature access:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to update plan-feature access: ' + errMsg });
  }
}
