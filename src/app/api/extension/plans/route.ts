import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' },
    });

    const formattedPlans = await Promise.all(
      plans.map(async (plan) => {
        const planFeatures = await db.planFeatureAccess.findMany({
          where: { planType: plan.planType, isEnabled: true },
          include: { feature: true },
        });

        return {
          planType: plan.planType,
          displayName: plan.displayName,
          monthlyPrice: plan.monthlyPrice,
          annualPrice: plan.annualPrice,
          dailyMessageLimit: plan.dailyMessageLimit,
          features: planFeatures.map((pf) => ({
            key: pf.featureKey,
            name: pf.feature.displayName,
            description: pf.feature.description,
          })),
        };
      })
    );

    return NextResponse.json(formattedPlans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
