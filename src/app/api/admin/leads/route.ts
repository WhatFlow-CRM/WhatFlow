import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const STATUS_DISPLAY_NAMES: Record<string, string> = {
  new: 'New Lead',
  interested: 'Interested',
  followup: 'Follow-up Required',
  converted: 'Converted',
  not_interested: 'Not Interested',
  complaint: 'Complaint',
  pending_payment: 'Pending Payment',
};

// GET /api/admin/leads — List leads with search, status filter, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.lead.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    // Enrich leads with assigned user name and status display name
    const enrichedLeads = await Promise.all(
      leads.map(async (lead) => {
        const result: Record<string, unknown> = {
          ...lead,
          statusDisplayName: STATUS_DISPLAY_NAMES[lead.status] || lead.status,
        };

        if (lead.assignedUserId) {
          try {
            const user = await db.user.findUnique({
              where: { id: lead.assignedUserId },
              select: { id: true, name: true, whatsappNumber: true },
            });
            if (user) {
              result.assignedUser = user;
            }
          } catch {
            // If user lookup fails, just skip it
          }
        }

        return result;
      })
    );

    return NextResponse.json({
      success: true,
      leads: enrichedLeads,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leads',
      leads: [],
      total: 0,
    });
  }
}

// POST /api/admin/leads — Create or update (upsert) a lead by phoneNumber
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, name, email, status, source, notes, assignedUserId } = body;

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: 'phoneNumber is required' });
    }

    const lead = await db.lead.upsert({
      where: { phoneNumber },
      create: {
        phoneNumber,
        name: name || null,
        email: email || null,
        status: status || 'new',
        source: source || 'manual',
        notes: notes || null,
        assignedUserId: assignedUserId || null,
        lastMessageAt: new Date(),
      },
      update: {
        ...(name !== undefined && name !== null && { name }),
        ...(email !== undefined && email !== null && { email }),
        ...(status !== undefined && status !== null && { status }),
        ...(source !== undefined && source !== null && { source }),
        ...(notes !== undefined && notes !== null && { notes }),
        ...(assignedUserId !== undefined && assignedUserId !== null && { assignedUserId }),
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Error upserting lead:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to save lead: ' + errMsg });
  }
}

// PUT /api/admin/leads — Update an existing lead by id
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, status, notes, assignedUserId } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' });
    }

    const existingLead = await db.lead.findUnique({ where: { id } });
    if (!existingLead) {
      return NextResponse.json({ success: false, error: 'Lead not found' });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined && name !== null) updateData.name = name;
    if (email !== undefined && email !== null) updateData.email = email;
    if (status !== undefined && status !== null) updateData.status = status;
    if (notes !== undefined && notes !== null) updateData.notes = notes;
    if (assignedUserId !== undefined && assignedUserId !== null) updateData.assignedUserId = assignedUserId;

    const lead = await db.lead.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Error updating lead:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to update lead: ' + errMsg });
  }
}

// DELETE /api/admin/leads — Delete a lead and clean up related reminders
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' });
    }

    const existingLead = await db.lead.findUnique({ where: { id } });
    if (!existingLead) {
      return NextResponse.json({ success: false, error: 'Lead not found' });
    }

    // Clean up related FollowUpReminders — set leadId to null
    await db.followUpReminder.updateMany({
      where: { leadId: id },
      data: { leadId: null },
    });

    // Delete the lead
    await db.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to delete lead: ' + errMsg });
  }
}
