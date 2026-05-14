import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    const key = await db.activationKey.findUnique({
      where: { id },
    });

    if (!key) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    if (action === 'deactivate') {
      if (key.status !== 'active') {
        return NextResponse.json(
          { error: `Cannot deactivate a key with status "${key.status}"` },
          { status: 400 }
        );
      }

      // Deactivate the key
      await db.activationKey.update({
        where: { id },
        data: { status: 'deactivated' },
      });

      // Deactivate the linked user if they are using this key
      if (key.linkedNumber) {
        const user = await db.user.findUnique({
          where: { whatsappNumber: key.linkedNumber },
        });

        if (user && user.currentKeyId === key.id) {
          await db.user.update({
            where: { whatsappNumber: key.linkedNumber },
            data: {
              isActive: false,
              lastPlanType: user.planType,
              planType: 'FreeTrial',
              currentKeyId: null,
            },
          });
        }
      }

      // Log activity
      await db.activityLog.create({
        data: {
          action: 'key_deactivated',
          details: JSON.stringify({
            keyId: id,
            key: key.key,
            previousStatus: key.status,
            linkedNumber: key.linkedNumber,
          }),
          ipAddress:
            request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Key deactivated successfully',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error performing key action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
