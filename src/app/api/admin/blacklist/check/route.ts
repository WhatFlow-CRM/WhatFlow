import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── Helper: Normalize phone number ──────────────────────────────────────────
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

// ── POST /api/admin/blacklist/check ─────────────────────────────────────────
// Check an array of phone numbers against the blacklist (used before campaigns)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { numbers } = body;

    if (!Array.isArray(numbers) || numbers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'numbers array is required',
      });
    }

    // Normalize all input numbers
    const normalizedNumbers = numbers.map((n: string) => normalizePhone(String(n))).filter(Boolean);
    const uniqueNumbers = [...new Set(normalizedNumbers)];

    // Look up all matching blacklist entries in one query
    const blacklistedEntries = await db.blacklistedNumber.findMany({
      where: {
        phoneNumber: { in: uniqueNumbers },
      },
    });

    const blacklistedSet = new Set(blacklistedEntries.map((e) => e.phoneNumber));
    const blacklistedNumbers = blacklistedEntries.map((e) => ({
      phoneNumber: e.phoneNumber,
      reason: e.reason,
      notes: e.notes,
    }));

    const safe = uniqueNumbers.filter((n) => !blacklistedSet.has(n));

    return NextResponse.json({
      success: true,
      checked: uniqueNumbers.length,
      blacklisted: [...blacklistedSet],
      safe,
      blacklistedNumbers,
    });
  } catch (error) {
    console.error('Error checking blacklist:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check numbers against blacklist',
    });
  }
}
