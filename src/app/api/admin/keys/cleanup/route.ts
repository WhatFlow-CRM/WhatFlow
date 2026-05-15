import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Specific test keys created during development/testing — to be permanently removed
const KNOWN_TEST_KEYS = [
  'WF-J7LZ-HLX8-HHTY-6ND9',
  'WF-NE2X-ADVN-C9D5',
  'WF-PERM-ADVAN-G7H1',
  'WF-YB9S-N9PE-ZZW2-8ZZT',
  'WF-DEMO-KEY4-YOU1',
  'WF-NE2X-BASIC-A7K3',
];

// Dummy key name patterns
const DUMMY_KEY_PATTERNS = ['TEST', '0000', 'DEMO'];

// Dummy phone number patterns
const DUMMY_NUMBER_PATTERNS = [
  '9230000000', '9231111111', '9232222222', '9233333333', '9234444444',
  '9235555555', '9236666666', '9237777777', '9238888888', '9239999999',
];

export async function POST() {
  try {
    const allKeys = await db.activationKey.findMany({
      select: { id: true, key: true, createdBy: true, status: true, linkedNumber: true },
    });

    const dummyKeyIds: string[] = [];
    const keptKeys: string[] = [];

    for (const k of allKeys) {
      const isKnownTest = KNOWN_TEST_KEYS.includes(k.key);
      const isSeed = k.createdBy === 'seed';
      const hasDummyPattern = DUMMY_KEY_PATTERNS.some(p => k.key.toUpperCase().includes(p));
      const isDummyLinked = k.linkedNumber && DUMMY_NUMBER_PATTERNS.some(
        p => k.linkedNumber!.includes(p)
      );

      if (isKnownTest || isSeed || hasDummyPattern || isDummyLinked) {
        dummyKeyIds.push(k.id);
      } else {
        keptKeys.push(`${k.key} (${k.status}, linked: ${k.linkedNumber || 'none'})`);
      }
    }

    if (dummyKeyIds.length === 0) {
      const users = await db.user.findMany({ orderBy: { createdAt: 'desc' } });
      const keys = await db.activationKey.findMany({ orderBy: { createdAt: 'desc' } });
      return NextResponse.json({
        success: true,
        message: 'Database is clean — no dummy keys found',
        removedKeys: 0,
        removedUsers: 0,
        keptKeys: keys.map(k => `${k.key} (${k.status}, linked: ${k.linkedNumber || 'none'})`),
        keptUsers: users.map(u => `${u.whatsappNumber} (${u.planType}, active: ${u.isActive})`),
      });
    }

    // 1. Unlink users referencing dummy keys → reset to FreeTrial
    const usersWithDummyKeys = await db.user.findMany({
      where: { currentKeyId: { in: dummyKeyIds } },
    });
    for (const user of usersWithDummyKeys) {
      // Check if this user has another real key they can use
      const otherKey = await db.activationKey.findFirst({
        where: {
          linkedNumber: user.whatsappNumber,
          id: { notIn: dummyKeyIds },
          status: 'active',
        },
      });
      await db.user.update({
        where: { id: user.id },
        data: {
          currentKeyId: otherKey ? otherKey.id : null,
          ...(otherKey
            ? { planType: otherKey.planType, isActive: true }
            : { planType: 'FreeTrial', isActive: false }),
        },
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

    // 4. Clean orphaned keys (linked to deleted users → reset to unused)
    let orphanedReset = 0;
    const remainingKeys = await db.activationKey.findMany({
      where: { linkedNumber: { not: null } },
      select: { id: true, linkedNumber: true },
    });
    for (const k of remainingKeys) {
      if (!k.linkedNumber) continue;
      const userExists = await db.user.findUnique({ where: { whatsappNumber: k.linkedNumber } });
      if (!userExists) {
        await db.activationKey.update({
          where: { id: k.id },
          data: { linkedNumber: null, status: 'unused' },
        });
        orphanedReset++;
      }
    }

    // Final state
    const finalKeys = await db.activationKey.findMany({ orderBy: { createdAt: 'desc' } });
    const finalUsers = await db.user.findMany({ orderBy: { createdAt: 'desc' } });

    return NextResponse.json({
      success: true,
      message: `Cleaned ${result.count} dummy key(s), ${dummyUsersRemoved} dummy user(s), ${orphanedReset} orphaned key(s) reset`,
      removedKeys: result.count,
      removedUsers: dummyUsersRemoved,
      orphanedKeysReset: orphanedReset,
      keptKeys: finalKeys.map(k => `${k.key} (${k.status}, linked: ${k.linkedNumber || 'none'})`),
      keptUsers: finalUsers.map(u => `${u.whatsappNumber} (${u.planType}, active: ${u.isActive})`),
    });
  } catch (error) {
    console.error('Error cleaning dummy keys:', error);
    return NextResponse.json({ error: 'Database operation failed' }, { status: 503 });
  }
}
