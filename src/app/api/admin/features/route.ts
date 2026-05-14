import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const features = await db.feature.findMany({
      orderBy: { featureKey: 'asc' },
    });

    // Get all plans
    const plans = await db.plan.findMany({
      orderBy: { monthlyPrice: 'asc' },
      select: { planType: true, displayName: true },
    });

    // Get all plan-feature access records
    const allAccess = await db.planFeatureAccess.findMany();

    // Build plan access matrix for each feature
    const featuresWithMatrix = await Promise.all(
      features.map(async (feature) => {
        const accessMatrix: Record<string, boolean> = {};
        for (const plan of plans) {
          const access = allAccess.find(
            (a) => a.planType === plan.planType && a.featureKey === feature.featureKey
          );
          accessMatrix[plan.planType] = access?.isEnabled ?? false;
        }

        return {
          ...feature,
          plans: accessMatrix,
        };
      })
    );

    return NextResponse.json({
      features: featuresWithMatrix,
      plans: plans.map((p) => ({ planType: p.planType, displayName: p.displayName })),
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { featureKey, isActive } = body;

    if (!featureKey) {
      return NextResponse.json({ error: 'featureKey is required' }, { status: 400 });
    }

    const feature = await db.feature.findUnique({
      where: { featureKey },
    });

    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    const updatedFeature = await db.feature.update({
      where: { featureKey },
      data: {
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ feature: updatedFeature });
  } catch (error) {
    console.error('Error updating feature:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
