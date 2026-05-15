import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const whatsappNumber = searchParams.get('whatsappNumber');

    if (!whatsappNumber) {
      return NextResponse.json({ error: 'whatsappNumber is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { whatsappNumber },
    });

    if (!user) {
      // Return all features as disabled for unknown user
      const allFeatures = await db.feature.findMany({ where: { isActive: true } });
      const features: Record<string, boolean> = {};
      for (const f of allFeatures) {
        features[f.featureKey] = false;
      }
      return NextResponse.json(features);
    }

    // Get plan feature access
    const planFeatures = await db.planFeatureAccess.findMany({
      where: { planType: user.planType },
    });

    // Get user feature overrides (these take priority)
    const overrides = await db.featureOverride.findMany({
      where: { userId: user.id },
    });

    // Get all active features
    const allFeatures = await db.feature.findMany({
      where: { isActive: true },
    });

    // Build features map: plan access as base, overrides on top
    const features: Record<string, boolean> = {};
    for (const feature of allFeatures) {
      const planAccess = planFeatures.find((f) => f.featureKey === feature.featureKey);
      const override = overrides.find((f) => f.featureKey === feature.featureKey);
      features[feature.featureKey] = override
        ? override.isEnabled
        : (planAccess?.isEnabled ?? false);
    }

    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json({});
  }
}
