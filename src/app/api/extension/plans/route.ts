import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' },
    });

    // Get system config for currency
    const currencyConfig = await db.systemConfig.findUnique({
      where: { key: 'currency' },
    });
    const currency = currencyConfig?.value || 'PKR';
    const currencySymbol = currency === 'USD' ? '$' : 'Rs.';

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
          currency,
          currencySymbol,
          features: planFeatures.map((pf) => ({
            key: pf.featureKey,
            name: pf.feature.displayName,
            description: pf.feature.description,
          })),
        };
      })
    );

    return NextResponse.json(formattedPlans, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json([
      {
        planType: 'Basic',
        displayName: 'Basic Plan',
        monthlyPrice: 500,
        annualPrice: 5000,
        dailyMessageLimit: 2000,
        currency: 'PKR',
        currencySymbol: 'Rs.',
        features: [],
      },
      {
        planType: 'Advance',
        displayName: 'Advance Plan',
        monthlyPrice: 1000,
        annualPrice: 10000,
        dailyMessageLimit: 5000,
        currency: 'PKR',
        currencySymbol: 'Rs.',
        features: [],
      },
    ], { headers: corsHeaders });
  }
}
