import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── Helper: Normalize phone number ──────────────────────────────────────────
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

// ── GET: List blacklisted numbers ────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const reason = searchParams.get('reason');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { phoneNumber: { contains: search } },
        { notes: { contains: search } },
        { reason: { contains: search } },
      ];
    }

    if (reason) {
      where.reason = reason;
    }

    const [numbers, total] = await Promise.all([
      db.blacklistedNumber.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.blacklistedNumber.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    const reasons = [
      { value: 'opted_out', label: 'Opted Out' },
      { value: 'wrong_number', label: 'Wrong Number' },
      { value: 'complaint', label: 'Complaint' },
      { value: 'manual_block', label: 'Manual Block' },
      { value: 'other', label: 'Other' },
    ];

    return NextResponse.json({
      success: true,
      numbers,
      total,
      page,
      limit,
      reasons,
    });
  } catch (error) {
    console.error('Error fetching blacklisted numbers:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch blacklisted numbers',
    });
  }
}

// ── POST: Add number to blacklist ────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, reason = 'manual_block', addedBy, notes } = body;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'phoneNumber is required',
      });
    }

    const normalized = normalizePhone(phoneNumber);

    if (normalized.length < 7) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is too short',
      });
    }

    const validReasons = ['opted_out', 'wrong_number', 'complaint', 'manual_block', 'other'];
    const finalReason = validReasons.includes(reason) ? reason : 'manual_block';

    await db.blacklistedNumber.upsert({
      where: { phoneNumber: normalized },
      create: {
        phoneNumber: normalized,
        reason: finalReason,
        addedBy: addedBy || null,
        notes: notes || null,
      },
      update: {
        reason: finalReason,
        notes: notes || undefined,
        addedBy: addedBy || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Number added to blacklist',
    });
  } catch (error: unknown) {
    console.error('Error adding to blacklist:', error);
    const message = error instanceof Error && error.message.includes('Unique')
      ? 'Number is already in the blacklist'
      : 'Failed to add number to blacklist';
    return NextResponse.json({ success: false, error: message });
  }
}

// ── DELETE: Remove number from blacklist ─────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, phoneNumber } = body;

    if (!id && !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Either id or phoneNumber is required',
      });
    }

    if (id) {
      await db.blacklistedNumber.delete({
        where: { id },
      });
    } else {
      const normalized = normalizePhone(phoneNumber);
      await db.blacklistedNumber.delete({
        where: { phoneNumber: normalized },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Number removed from blacklist',
    });
  } catch (error: unknown) {
    console.error('Error removing from blacklist:', error);
    const message = error instanceof Error && error.message.includes('Record to delete')
      ? 'Number not found in blacklist'
      : 'Failed to remove number from blacklist';
    return NextResponse.json({ success: false, error: message });
  }
}
