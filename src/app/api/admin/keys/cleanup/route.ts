import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Dummy key patterns
const DUMMY_KEY_PATTERNS = ['TEST', '0000', '0001', '0002', '0003', 'AAAA', 'BBBB', 'CCCC', 'DDDD', 'FAKE', 'DEMO'];

// Dummy phone number patterns (not real users)
const DUMMY_NUMBER_PATTERNS = [
  '9230000000', '9231111111', '9232222222', '9233333333', '9234444444',
  '9235555555', '9236666666', '9237777777', '9238888888', '9239999999',
  'test', 'dummy', '0000000000',
];

export async function POST() {
  try {
    const allKeys = await db.activationKey.findMany({
      select: { id: true, key: true, createdBy: true, status: true, linkedNumber: true },
    });

    const dummyKeyIds: string[] = [];
    const keptKeys: string[] = [];

    for (const k of allKeys) {
      const isSeed = k.createdBy === 'seed';
      const isDummyKey = DUMMY_KEY_PATTERNS.some(p => k.key.toUpperCase().includes(p));

      // Check if linked to a dummy number
      const isDummyLinked = k.linkedNumber && DUMMY_NUMBER_PATTERNS.some(
        p => k.linkedNumber!.toLowerCase().includes(p.toLowerCase())
      );

      if (isSeed || isDummyKey || isDummyLinked) {
        dummyKeyIds.push(k.id);
      } else {
        keptKeys.push(`${k.key} (${k.status}, linked: ${k.linkedNumber || 'none'})`);
      }
    }

    if (dummyKeyIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No dummy keys found — database is clean',
        removedKeys: 0,
        removedUsers: 0,
        keptKeys,
      });
    }

    // 1. Unlink users referencing dummy keys
    const usersWithDummyKeys = await db.user.findMany({
      where: { currentKeyId: { in: dummyKeyIds } },
    });
    for (const user of usersWithDummyKeys) {
      await db.user.update({
        where: { id: user.id },
        data: { currentKeyId: null, planType: 'FreeTrial', isActive: false },
      });
    }

    // 2. Delete dummy keys
    const result = await db.activationKey.deleteMany({
      where: { id: { in: dummyKeyIds } },
    });

    // 3. Delete dummy users
    let dummyUsersRemoved = 0;
    for (const pattern of DUMMY_NUMBER_PATTERNS) {
      try {
        const dummyUsers = await db.user.findMany({
          where: { whatsappNumber: { contains: pattern } },
        });
        if (dummyUsers.length > 0) {
          const ids = dummyUsers.map(u => u.id);
          try { await db.activityLog.deleteMany({ where: { userId: { in: ids } } }); } catch {}
          const r = await db.user.deleteMany({ where: { id: { in: ids } } });
          dummyUsersRemoved += r.count;
        }
      } catch {}
    }

    // 4. Clean orphaned keys (linked to deleted users)
    const remainingKeys = await db.activationKey.findMany({
      select: { id: true, linkedNumber: true },
    });
    let orphanedRemoved = 0;
    for (const k of remainingKeys) {
      if (!k.linkedNumber) continue;
      const userExists = await db.user.findUnique({ where: { whatsappNumber: k.linkedNumber } });
      if (!userExists) {
        await db.activationKey.update({
          where: { id: k.id },
          data: { linkedNumber: null, status: 'unused' },
        });
        orphanedRemoved++;
      }
    }

    // Final count of real keys
    const finalKeys = await db.activationKey.findMany({ orderBy: { createdAt: 'desc' } });
    const finalUsers = await db.user.findMany({ orderBy: { createdAt: 'desc' } });

    return NextResponse.json({
      success: true,
      message: `Cleaned ${result.count} dummy key(s), ${dummyUsersRemoved} dummy user(s), ${orphanedRemoved} orphaned key(s)`,
      removedKeys: result.count,
      removedUsers: dummyUsersRemoved,
      orphanedKeysReset: orphanedRemoved,
      keptKeys: finalKeys.map(k => `${k.key} (${k.status}, linked: ${k.linkedNumber || 'none'})`),
      keptUsers: finalUsers.map(u => `${u.whatsappNumber} (${u.planType}, active: ${u.isActive})`),
    });
  } catch (error) {
    console.error('Error cleaning dummy keys:', error);
    return NextResponse.json({ error: 'Database operation failed' }, { status: 503 });
  }
}
