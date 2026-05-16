import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { planType, isActive, expiresAt } = body;

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' });
    }

    const updateData: Record<string, unknown> = {};

    if (planType !== undefined) {
      updateData.lastPlanType = user.planType;
      updateData.planType = planType;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (expiresAt !== undefined) {
      updateData.expiresAt = new Date(expiresAt);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' }
      );
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'user_updated',
        details: JSON.stringify({
          updatedFields: Object.keys(updateData),
          previousPlanType: user.planType,
          newPlanType: updatedUser.planType,
        }),
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          null,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: 'Failed to update user: ' + errMsg });
  }
}
