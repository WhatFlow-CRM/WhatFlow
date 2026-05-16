import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/campaigns/[id] — Get single campaign with paginated messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await db.campaign.findUnique({
      where: { id },
      include: { messages: true },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' });
    }

    // Get user phone number
    const user = await db.user.findUnique({
      where: { id: campaign.userId },
      select: { whatsappNumber: true },
    });

    // Paginate messages
    const { searchParams } = new URL(request.url);
    const msgPage = parseInt(searchParams.get('page') || '1', 10);
    const msgLimit = parseInt(searchParams.get('limit') || '50', 10);
    const msgSkip = (msgPage - 1) * msgLimit;
    const msgStatus = searchParams.get('messageStatus');

    const msgWhere: Record<string, unknown> = { campaignId: id };
    if (msgStatus) {
      msgWhere.status = msgStatus;
    }

    const [messages, messageTotal] = await Promise.all([
      db.campaignMessage.findMany({
        where: msgWhere,
        orderBy: { createdAt: 'asc' },
        skip: msgSkip,
        take: msgLimit,
      }),
      db.campaignMessage.count({
        where: msgWhere,
      }),
    ]);

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        userPhone: user?.whatsappNumber || null,
        _count: { messages: messageTotal },
      },
      messages,
      messageTotal,
      messagePage: msgPage,
      messageLimit: msgLimit,
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch campaign' });
  }
}

// DELETE /api/admin/campaigns/[id] — Delete a campaign and all its messages
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Campaign not found' });
    }

    // Delete messages first (or rely on cascade), then delete campaign
    // The schema has onDelete: Cascade, but we explicitly delete messages for safety
    await db.campaignMessage.deleteMany({ where: { campaignId: id } });
    await db.campaign.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to delete campaign: ' + errMsg });
  }
}
