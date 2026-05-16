import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── Helper: Normalize phone number ──────────────────────────────────────────
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

// ── POST /api/admin/blacklist/bulk ──────────────────────────────────────────
// Bulk-add numbers to the blacklist, skipping duplicates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { numbers, reason = 'manual_block', addedBy } = body;

    if (!Array.isArray(numbers) || numbers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'numbers array is required',
      });
    }

    const validReasons = ['opted_out', 'wrong_number', 'complaint', 'manual_block', 'other'];
    const finalReason = validReasons.includes(reason) ? reason : 'manual_block';

    // Normalize and deduplicate input
    const normalized = numbers
      .map((n: string) => normalizePhone(String(n)))
      .filter((n: string) => n.length >= 7);
    const unique = [...new Set(normalized)];

    // Find existing entries to skip
    const existing = await db.blacklistedNumber.findMany({
      where: { phoneNumber: { in: unique } },
      select: { phoneNumber: true },
    });
    const existingSet = new Set(existing.map((e) => e.phoneNumber));

    const toAdd = unique.filter((n) => !existingSet.has(n));

    if (toAdd.length > 0) {
      // Insert in batches of 100 to avoid SQLite limits
      const BATCH_SIZE = 100;
      for (let i = 0; i < toAdd.length; i += BATCH_SIZE) {
        const batch = toAdd.slice(i, i + BATCH_SIZE);
        await db.blacklistedNumber.createMany({
          data: batch.map((phoneNumber) => ({
            phoneNumber,
            reason: finalReason,
            addedBy: addedBy || null,
          })),
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      added: toAdd.length,
      skipped: unique.length - toAdd.length,
    });
  } catch (error) {
    console.error('Error bulk-adding to blacklist:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to bulk-add numbers to blacklist',
    });
  }
}
