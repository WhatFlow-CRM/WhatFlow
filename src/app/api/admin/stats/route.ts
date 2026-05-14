import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [totalUsers, activeUsers, totalKeys, activeKeys, pendingPayments] =
      await Promise.all([
        db.user.count(),
        db.user.count({ where: { isActive: true } }),
        db.activationKey.count(),
        db.activationKey.count({ where: { status: 'active' } }),
        db.activityLog.count({
          where: { action: 'payment_submitted' },
        }),
      ]);

    // Revenue: count of all approved payment logs (sum from details)
    const approvedPayments = await db.activityLog.findMany({
      where: { action: 'payment_approved' },
      select: { details: true },
    });

    let revenue = 0;
    for (const payment of approvedPayments) {
      try {
        const details = payment.details ? JSON.parse(payment.details) : null;
        if (details?.amount) {
          revenue += parseFloat(String(details.amount));
        }
      } catch {
        // Skip malformed details
      }
    }

    // New users this month
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await db.user.count({
      where: { createdAt: { gte: firstOfMonth } },
    });

    // Keys activated this month
    const keysActivatedThisMonth = await db.activationKey.count({
      where: {
        activatedAt: { gte: firstOfMonth },
      },
    });

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalKeys,
      activeKeys,
      unusedKeys: totalKeys - activeKeys,
      pendingPayments,
      revenue,
      newUsersThisMonth,
      keysActivatedThisMonth,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
