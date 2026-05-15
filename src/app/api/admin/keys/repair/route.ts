import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/admin/keys/repair
// Repairs user-key linkages: ensures all active keys have their linked users properly set up
export async function POST() {
  try {
    // Find all active keys
    const activeKeys = await db.activationKey.findMany({
      where: { status: 'active', linkedNumber: { not: null } },
    });

    let repaired = 0;
    const details: string[] = [];

    for (const key of activeKeys) {
      if (!key.linkedNumber) continue;

      const user = await db.user.findUnique({
        where: { whatsappNumber: key.linkedNumber },
      });

      if (!user) {
        // Create user for this active key
        await db.user.create({
          data: {
            whatsappNumber: key.linkedNumber,
            planType: key.planType,
            isActive: true,
            currentKeyId: key.id,
            activatedAt: key.activatedAt,
            expiresAt: key.expiresAt,
          },
        });
        repaired++;
        details.push(`Created user ${key.linkedNumber} → ${key.planType} (key: ${key.key})`);
      } else {
        // Fix user if not properly linked
        const needsFix =
          user.currentKeyId !== key.id ||
          user.planType !== key.planType ||
          !user.isActive;

        if (needsFix) {
          await db.user.update({
            where: { whatsappNumber: key.linkedNumber },
            data: {
              planType: key.planType,
              isActive: true,
              currentKeyId: key.id,
              activatedAt: key.activatedAt || user.activatedAt,
              expiresAt: key.expiresAt || user.expiresAt,
            },
          });
          repaired++;
          details.push(`Fixed user ${key.linkedNumber} → ${key.planType} (key: ${key.key})`);
        }
      }
    }

    // Also find users with stale key references
    const allUsers = await db.user.findMany();
    for (const user of allUsers) {
      if (user.currentKeyId) {
        const key = await db.activationKey.findUnique({ where: { id: user.currentKeyId } });
        if (!key || key.status !== 'active') {
          await db.user.update({
            where: { id: user.id },
            data: {
              currentKeyId: null,
              isActive: false,
              lastPlanType: user.planType,
              planType: 'FreeTrial',
            },
          });
          repaired++;
          details.push(`Reset user ${user.whatsappNumber} → FreeTrial (key no longer active)`);
        }
      }
    }

    // Final state
    const finalKeys = await db.activationKey.findMany({ orderBy: { createdAt: 'desc' } });
    const finalUsers = await db.user.findMany({ orderBy: { createdAt: 'desc' } });

    return NextResponse.json({
      success: true,
      message: `Repaired ${repaired} user-key linkage(s)`,
      repaired,
      details,
      keptKeys: finalKeys.map(k => `${k.key} (${k.status}, ${k.planType}, linked: ${k.linkedNumber || 'none'})`),
      keptUsers: finalUsers.map(u => `${u.whatsappNumber} (${u.planType}, active: ${u.isActive})`),
    });
  } catch (error) {
    console.error('Error repairing keys:', error);
    return NextResponse.json({ error: 'Database operation failed' }, { status: 503 });
  }
}
