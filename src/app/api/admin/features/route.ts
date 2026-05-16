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
    return NextResponse.json({ features: [], plans: [] });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { featureKey, displayName, isActive } = body;

    if (!featureKey) {
      return NextResponse.json({ success: false, error: 'featureKey is required' });
    }

    const existingFeature = await db.feature.findUnique({
      where: { featureKey },
    });

    let feature;
    if (existingFeature) {
      // Update existing
      feature = await db.feature.update({
        where: { featureKey },
        data: {
          ...(isActive !== undefined && { isActive }),
          ...(displayName && { displayName }),
        },
      });
    } else if (displayName) {
      // Create new (only if displayName provided)
      feature = await db.feature.create({
        data: { featureKey, displayName, isActive: isActive !== undefined ? isActive : true },
      });
    } else {
      return NextResponse.json({ success: false, error: 'Feature not found. Provide displayName to create it.' });
    }

    return NextResponse.json({ feature });
  } catch (error) {
    console.error('Error updating feature:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to update feature: ' + errMsg });
  }
}
