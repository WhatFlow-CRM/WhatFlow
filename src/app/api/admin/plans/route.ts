import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      orderBy: { monthlyPrice: 'asc' },
    });

    // Get user counts per planType
    let userCounts: Record<string, number> = {};
    try {
      const grouped = await db.user.groupBy({
        by: ['planType'],
        _count: { id: true },
      });
      for (const g of grouped) {
        userCounts[g.planType] = g._count.id;
      }
    } catch { /* groupBy may fail on empty table */ }

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
          _count: { users: userCounts[plan.planType] ?? 0 },
        };
      })
    );

    return NextResponse.json({ plans: plansWithFeatures });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch plans',
      plans: [],
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, displayName, monthlyPrice, annualPrice, dailyMessageLimit, isActive } =
      body;

    if (!planType) {
      return NextResponse.json({ success: false, error: 'planType is required' });
    }

    const plan = await db.plan.findUnique({
      where: { planType },
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plan not found' });
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

    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error('Error updating plan:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to update plan: ' + errMsg });
  }
}
