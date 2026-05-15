import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Patterns that identify dummy/test keys
const DUMMY_PATTERNS = ['TEST', '0000', '0001', '0002', '0003', 'AAAA', 'BBBB', 'CCCC', 'DDDD', 'FAKE'];

export async function POST() {
  try {
    // Find all keys
    const allKeys = await db.activationKey.findMany({
      select: { id: true, key: true, createdBy: true, status: true, linkedNumber: true },
    });

    const dummyKeyIds: string[] = [];
    const keptKeys: string[] = [];

    for (const k of allKeys) {
      const isSeed = k.createdBy === 'seed';
      const isDummy = DUMMY_PATTERNS.some(p => k.key.toUpperCase().includes(p));

      if (isSeed || isDummy) {
        dummyKeyIds.push(k.id);
      } else {
        keptKeys.push(k.key + ' (' + k.status + ', linked: ' + (k.linkedNumber || 'none') + ')');
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

    // Unlink users that reference these dummy keys
    const usersWithDummyKeys = await db.user.findMany({
      where: { currentKeyId: { in: dummyKeyIds } },
    });

    for (const user of usersWithDummyKeys) {
      await db.user.update({
        where: { id: user.id },
        data: {
          currentKeyId: null,
          planType: 'FreeTrial',
          isActive: false,
        },
      });
    }

    // Delete all dummy keys
    const result = await db.activationKey.deleteMany({
      where: { id: { in: dummyKeyIds } },
    });

    // Clean dummy test users (numbers like 923000000000, 923111111111, etc.)
    const dummyUsers = await db.user.findMany({
      where: {
        OR: [
          { whatsappNumber: { startsWith: '9230000000' } },
          { whatsappNumber: { startsWith: '9231111111' } },
          { whatsappNumber: { startsWith: '9239999999' } },
        ],
      },
    });

    let dummyUsersRemoved = 0;
    if (dummyUsers.length > 0) {
      const dummyUserIds = dummyUsers.map(u => u.id);
      try { await db.activityLog.deleteMany({ where: { userId: { in: dummyUserIds } } }); } catch {}
      try {
        const duResult = await db.user.deleteMany({ where: { id: { in: dummyUserIds } } });
        dummyUsersRemoved = duResult.count;
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned ${result.count} dummy key(s) and ${dummyUsersRemoved} dummy user(s)`,
      removedKeys: result.count,
      removedUsers: dummyUsersRemoved,
      keptKeys,
    });
  } catch (error) {
    console.error('Error cleaning dummy keys:', error);
    return NextResponse.json({ error: 'Database operation failed' }, { status: 503 });
  }
}
