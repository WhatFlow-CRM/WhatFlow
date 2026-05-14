import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      orderBy: { monthlyPrice: 'asc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    // Get feature access for each plan
    const plansWithFeatures = await Promise.all(
      plans.map(async (plan) => {
        const featureAccess = await db.planFeatureAccess.findMany({
          where: { planType: plan.planType },
          include: { feature: true },
        });

        return {
          ...plan,
          features: featureAccess.map((fa) => ({
            featureKey: fa.featureKey,
            featureName: fa.feature.displayName,
            isEnabled: fa.isEnabled,
          })),
        };
      })
    );

    return NextResponse.json({ plans: plansWithFeatures });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, displayName, monthlyPrice, annualPrice, dailyMessageLimit, isActive } =
      body;

    if (!planType) {
      return NextResponse.json({ error: 'planType is required' }, { status: 400 });
    }

    const plan = await db.plan.findUnique({
      where: { planType },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const updatedPlan = await db.plan.update({
      where: { planType },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(monthlyPrice !== undefined && { monthlyPrice: parseFloat(String(monthlyPrice)) }),
        ...(annualPrice !== undefined && { annualPrice: parseFloat(String(annualPrice)) }),
        ...(dailyMessageLimit !== undefined && {
          dailyMessageLimit: parseInt(String(dailyMessageLimit), 10),
        }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ plan: updatedPlan });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
