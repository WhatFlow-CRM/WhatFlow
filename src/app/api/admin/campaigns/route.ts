import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/campaigns — List campaigns with filters
// GET /api/admin/campaigns/analytics — Dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Analytics endpoint
    if (searchParams.get('analytics') === 'true') {
      return getAnalytics();
    }

    // List campaigns
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) (where.createdAt as Record<string, unknown>).gte = new Date(fromDate);
      if (toDate) (where.createdAt as Record<string, unknown>).lte = new Date(toDate);
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      db.campaign.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          messages: true,
        },
      }),
      db.campaign.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    // Get user phone numbers for all unique userIds in campaigns
    const userIds = [...new Set(campaigns.map((c) => c.userId))];
    const users = userIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, whatsappNumber: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u.whatsappNumber]));

    const campaignsData = campaigns.map((c) => ({
      ...c,
      userPhone: userMap.get(c.userId) || null,
    }));

    // Compute summary stats
    const summaryWhere = Object.keys(where).length > 0 ? where : undefined;
    const [summaryAgg, statusCounts] = await Promise.all([
      db.campaign.aggregate({
        where: summaryWhere,
        _sum: {
          sentCount: true,
          failedCount: true,
          pendingCount: true,
        },
        _count: true,
      }),
      db.campaign.groupBy({
        by: ['status'],
        where: summaryWhere,
        _count: true,
      }),
    ]);

    const statusMap: Record<string, number> = {
      pending: 0,
      running: 0,
      completed: 0,
      paused: 0,
      failed: 0,
    };
    for (const sc of statusCounts) {
      if (sc.status in statusMap) {
        statusMap[sc.status] = sc._count;
      }
    }

    return NextResponse.json({
      success: true,
      campaigns: campaignsData,
      total,
      summary: {
        total: summaryAgg._count,
        ...statusMap,
        totalSent: summaryAgg._sum.sentCount || 0,
        totalFailed: summaryAgg._sum.failedCount || 0,
        totalPending: summaryAgg._sum.pendingCount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch campaigns' });
  }
}

// POST /api/admin/campaigns — Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, userId, totalNumbers } = body;

    if (!name || !userId) {
      return NextResponse.json({ success: false, error: 'name and userId are required' });
    }

    const campaign = await db.campaign.create({
      data: {
        name,
        userId,
        totalNumbers: totalNumbers || 0,
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to create campaign: ' + errMsg });
  }
}

// PUT /api/admin/campaigns — Update campaign stats/status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, name, totalNumbers, validNumbers, invalidNumbers, duplicateNumbers, blacklistedNumbers, sentCount, failedCount, pendingCount, responseCount, startedAt, completedAt } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' });
    }

    const existing = await db.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Campaign not found' });
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) updateData.status = status;
    if (name !== undefined) updateData.name = name;
    if (totalNumbers !== undefined) updateData.totalNumbers = totalNumbers;
    if (validNumbers !== undefined) updateData.validNumbers = validNumbers;
    if (invalidNumbers !== undefined) updateData.invalidNumbers = invalidNumbers;
    if (duplicateNumbers !== undefined) updateData.duplicateNumbers = duplicateNumbers;
    if (blacklistedNumbers !== undefined) updateData.blacklistedNumbers = blacklistedNumbers;
    if (sentCount !== undefined) updateData.sentCount = sentCount;
    if (failedCount !== undefined) updateData.failedCount = failedCount;
    if (pendingCount !== undefined) updateData.pendingCount = pendingCount;
    if (responseCount !== undefined) updateData.responseCount = responseCount;
    if (startedAt !== undefined) updateData.startedAt = startedAt ? new Date(startedAt) : null;
    if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' });
    }

    const campaign = await db.campaign.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to update campaign: ' + errMsg });
  }
}

// ──────────────────────────────────────────────
// Analytics helper
// ──────────────────────────────────────────────
async function getAnalytics() {
  // Overall aggregate stats
  const agg = await db.campaign.aggregate({
    _count: true,
    _sum: {
      totalNumbers: true,
      validNumbers: true,
      invalidNumbers: true,
      duplicateNumbers: true,
      blacklistedNumbers: true,
      sentCount: true,
      failedCount: true,
      pendingCount: true,
      responseCount: true,
    },
  });

  // Per-status counts
  const statusCounts = await db.campaign.groupBy({
    by: ['status'],
    _count: true,
  });

  const byStatus: Record<string, number> = {
    pending: 0,
    running: 0,
    completed: 0,
    paused: 0,
    failed: 0,
  };
  for (const sc of statusCounts) {
    if (sc.status in byStatus) {
      byStatus[sc.status] = sc._count;
    }
  }

  const totalSent = agg._sum.sentCount || 0;
  const totalFailed = agg._sum.failedCount || 0;
  const totalProcessed = totalSent + totalFailed;
  const avgDeliveryRate = totalProcessed > 0
    ? Math.round((totalSent / totalProcessed) * 10000) / 100
    : 0;

  const totalNumbers = agg._sum.totalNumbers || 0;
  const totalResponses = agg._sum.responseCount || 0;
  const avgResponseRate = totalSent > 0
    ? Math.round((totalResponses / totalSent) * 10000) / 100
    : 0;

  // Daily stats for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const dailyRaw = await db.campaign.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: thirtyDaysAgo },
    },
    _sum: {
      sentCount: true,
      failedCount: true,
    },
    _count: true,
  });

  // Bucket into YYYY-MM-DD
  const dailyMap: Record<string, { campaigns: number; sent: number; failed: number }> = {};
  for (const row of dailyRaw) {
    const dateKey = row.createdAt.toISOString().split('T')[0];
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = { campaigns: 0, sent: 0, failed: 0 };
    }
    dailyMap[dateKey].campaigns += 1;
    dailyMap[dateKey].sent += row._sum.sentCount || 0;
    dailyMap[dateKey].failed += row._sum.failedCount || 0;
  }

  const dailyStats = Object.entries(dailyMap)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    success: true,
    analytics: {
      totalCampaigns: agg._count,
      completedCampaigns: byStatus.completed,
      pausedCampaigns: byStatus.paused,
      failedCampaigns: byStatus.failed,
      totalNumbersProcessed: agg._sum.totalNumbers || 0,
      totalSent,
      totalFailed,
      totalPending: agg._sum.pendingCount || 0,
      totalInvalid: agg._sum.invalidNumbers || 0,
      totalDuplicate: agg._sum.duplicateNumbers || 0,
      totalBlacklisted: agg._sum.blacklistedNumbers || 0,
      totalResponses,
      avgDeliveryRate,
      avgResponseRate,
      byStatus,
      dailyStats,
    },
  });
}
