import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ─── GET: List reminders with filters, auto-mark overdue ─────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const phoneNumber = searchParams.get('phoneNumber');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // ── Auto-mark overdue reminders ──
    const now = new Date();
    try {
      // Find all pending reminders where reminderDate (+ optional reminderTime) < now
      const pendingReminders = await db.followUpReminder.findMany({
        where: { status: 'pending' },
      });

      const overdueIds: string[] = [];
      for (const r of pendingReminders) {
        let reminderMoment: Date;
        if (r.reminderTime) {
          const [hours, minutes] = r.reminderTime.split(':').map(Number);
          reminderMoment = new Date(r.reminderDate);
          reminderMoment.setHours(hours, minutes, 0, 0);
        } else {
          reminderMoment = new Date(r.reminderDate);
          reminderMoment.setHours(23, 59, 59, 999); // end of day if no time
        }
        if (reminderMoment < now) {
          overdueIds.push(r.id);
        }
      }

      if (overdueIds.length > 0) {
        await db.followUpReminder.updateMany({
          where: { id: { in: overdueIds } },
          data: { status: 'overdue' },
        });
      }
    } catch {
      // Non-critical: continue even if auto-mark fails
    }

    // ── Build where clause ──
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (phoneNumber) {
      where.phoneNumber = { contains: phoneNumber, mode: 'insensitive' };
    }

    if (fromDate || toDate) {
      where.reminderDate = {};
      if (fromDate) {
        (where.reminderDate as Record<string, unknown>).gte = new Date(fromDate);
      }
      if (toDate) {
        // Include the entire day
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        (where.reminderDate as Record<string, unknown>).lte = end;
      }
    }

    const hasFilters = Object.keys(where).length > 0;

    // ── Count overdue ──
    let overdueCount = 0;
    try {
      overdueCount = await db.followUpReminder.count({
        where: { status: 'overdue' },
      });
    } catch { /* empty table */ }

    // ── Fetch with pagination ──
    const skip = (page - 1) * limit;

    const [reminders, total] = await Promise.all([
      db.followUpReminder.findMany({
        where: hasFilters ? where : undefined,
        include: {
          lead: {
            select: { id: true, name: true, phoneNumber: true, status: true },
          },
        },
        orderBy: { reminderDate: 'asc' },
        skip,
        take: limit,
      }),
      db.followUpReminder.count({
        where: hasFilters ? where : undefined,
      }),
    ]);

    return NextResponse.json({
      success: true,
      reminders,
      total,
      overdueCount,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch reminders',
      reminders: [],
      total: 0,
      overdueCount: 0,
    });
  }
}

// ─── POST: Create a reminder ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, userId, reminderDate, reminderTime, note, leadId } = body;

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: 'phoneNumber is required' });
    }
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' });
    }
    if (!reminderDate) {
      return NextResponse.json({ success: false, error: 'reminderDate is required' });
    }

    const date = new Date(reminderDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ success: false, error: 'reminderDate must be a valid date' });
    }

    // Validate date is not in the past
    const now = new Date();
    let reminderMoment = new Date(date);
    if (reminderTime) {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      reminderMoment.setHours(hours, minutes, 0, 0);
    } else {
      reminderMoment.setHours(23, 59, 59, 999);
    }

    if (reminderMoment < now) {
      return NextResponse.json({
        success: false,
        error: 'reminderDate cannot be in the past',
      });
    }

    // Validate leadId if provided
    if (leadId) {
      const lead = await db.lead.findUnique({ where: { id: leadId } });
      if (!lead) {
        return NextResponse.json({ success: false, error: 'Lead not found' });
      }
    }

    const reminder = await db.followUpReminder.create({
      data: {
        phoneNumber,
        userId,
        reminderDate: date,
        reminderTime: reminderTime || null,
        note: note || null,
        leadId: leadId || null,
      },
      include: {
        lead: {
          select: { id: true, name: true, phoneNumber: true, status: true },
        },
      },
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error) {
    console.error('Error creating reminder:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to create reminder: ' + errMsg });
  }
}

// ─── PUT: Update a reminder ──────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, reminderDate, reminderTime, note } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' });
    }

    const existing = await db.followUpReminder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Reminder not found' });
    }

    const data: Record<string, unknown> = {};

    // Handle status changes
    if (status) {
      if (!['pending', 'completed', 'overdue'].includes(status)) {
        return NextResponse.json({
          success: false,
          error: 'status must be one of: pending, completed, overdue',
        });
      }
      data.status = status;

      // Auto-set completedAt when marking as completed
      if (status === 'completed') {
        data.completedAt = new Date();
      }
    }

    // Handle date/time reschedule
    if (reminderDate !== undefined) {
      const date = new Date(reminderDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ success: false, error: 'reminderDate must be a valid date' });
      }
      data.reminderDate = date;

      // If rescheduling, set status back to pending
      if (existing.status !== 'pending') {
        data.status = 'pending';
        data.completedAt = null;
      }
    }

    if (reminderTime !== undefined) {
      data.reminderTime = reminderTime || null;
    }

    if (note !== undefined) {
      data.note = note || null;
    }

    // If no fields to update
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' });
    }

    const reminder = await db.followUpReminder.update({
      where: { id },
      data,
      include: {
        lead: {
          select: { id: true, name: true, phoneNumber: true, status: true },
        },
      },
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to update reminder: ' + errMsg });
  }
}

// ─── DELETE: Delete a reminder ───────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' });
    }

    const existing = await db.followUpReminder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Reminder not found' });
    }

    await db.followUpReminder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to delete reminder: ' + errMsg });
  }
}
