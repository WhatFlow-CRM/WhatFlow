import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const existingPlans = await db.plan.count();

    if (existingPlans > 0) {
      return NextResponse.json({ message: 'Plans already exist' });
    }

    const defaultPlans = [
      {
        planType: 'Basic',
        displayName: 'Basic Plan',
        monthlyPrice: 499,
        annualPrice: 4990,
        dailyMessageLimit: 100,
        features: JSON.stringify([
          'Up to 100 messages per day',
          'Basic contact management',
          'Single WhatsApp account',
          'Email support',
        ]),
        isActive: true,
      },
      {
        planType: 'Advance',
        displayName: 'Advance Plan',
        monthlyPrice: 999,
        annualPrice: 9990,
        dailyMessageLimit: 500,
        features: JSON.stringify([
          'Up to 500 messages per day',
          'Advanced contact management',
          'Bulk messaging',
          'Schedule messages',
          'Priority support',
        ]),
        isActive: true,
      },
      {
        planType: 'Premium',
        displayName: 'Premium Plan',
        monthlyPrice: 1999,
        annualPrice: 19990,
        dailyMessageLimit: 2000,
        features: JSON.stringify([
          'Up to 2000 messages per day',
          'Premium contact management',
          'Bulk messaging',
          'Schedule messages',
          'Auto-reply',
          'Multi-account support',
          '24/7 priority support',
          'API access',
        ]),
        isActive: true,
      },
    ];

    await db.plan.createMany({ data: defaultPlans });

    return NextResponse.json({ message: 'Default plans seeded successfully', count: defaultPlans.length });
  } catch (error) {
    console.error('Error seeding plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
