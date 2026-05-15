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
      return NextResponse.json({
        planType: 'FreeTrial',
        isActive: false,
        expiresAt: null,
        subscribedAt: null,
        lastPlanType: null,
        dailyMessageLimit: 50,
        features: {},
        paymentStatus: null,
      });
    }

    // Check if subscription is expired
    let isActive = user.isActive;
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      isActive = false;
    }

    const plan = await db.plan.findUnique({
      where: { planType: user.planType },
    });

    // Get plan feature access
    const planFeatures = await db.planFeatureAccess.findMany({
      where: { planType: user.planType },
    });

    // Get user feature overrides
    const overrides = await db.featureOverride.findMany({
      where: { userId: user.id },
    });

    // Get all active features
    const allFeatures = await db.feature.findMany({
      where: { isActive: true },
    });

    // Build features map: plan access as default, overrides on top
    const features: Record<string, boolean> = {};
    for (const feature of allFeatures) {
      const planAccess = planFeatures.find(f => f.featureKey === feature.featureKey);
      const override = overrides.find(f => f.featureKey === feature.featureKey);
      features[feature.featureKey] = override ? override.isEnabled : (planAccess?.isEnabled ?? false);
    }

    return NextResponse.json({
      planType: user.planType,
      isActive,
      expiresAt: user.expiresAt,
      subscribedAt: user.activatedAt,
      lastPlanType: user.lastPlanType,
      dailyMessageLimit: plan?.dailyMessageLimit ?? 50,
      features,
      paymentStatus: null,
    });
  } catch (error) {
    console.error('Error fetching extension status:', error);
    return NextResponse.json({
      planType: 'FreeTrial',
      isActive: false,
      expiresAt: null,
      subscribedAt: null,
      lastPlanType: null,
      dailyMessageLimit: 50,
      features: {},
      paymentStatus: null,
    });
  }
}
