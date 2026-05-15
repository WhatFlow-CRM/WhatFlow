import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, featureKey, isEnabled } = body;

    if (!planType || !featureKey) {
      return NextResponse.json(
        { error: 'planType and featureKey are required' },
        { status: 400 }
      );
    }

    // Verify plan exists
    const plan = await db.plan.findUnique({ where: { planType } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Verify feature exists
    const feature = await db.feature.findUnique({ where: { featureKey } });
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
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
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
}
