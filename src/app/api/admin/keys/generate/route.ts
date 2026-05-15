import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateActivationKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = [4, 4, 4, 4];
  return (
    'WF-' +
    segments
      .map((len) =>
        Array.from(
          { length: len },
          () => chars[Math.floor(Math.random() * chars.length)]
        ).join('')
      )
      .join('-')
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, durationDays, count = 1, whatsappNumber } = body;

    if (!planType || !durationDays) {
      return NextResponse.json(
        { error: 'planType and durationDays are required' },
        { status: 400 }
      );
    }

    // Verify plan exists
    const plan = await db.plan.findUnique({
      where: { planType },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Validate count
    const numKeys = Math.min(Math.max(parseInt(String(count), 10) || 1, 1), 100);

    // Generate unique keys
    const generatedKeys: string[] = [];
    const existingKeys = new Set(
      (
        await db.activationKey.findMany({
          select: { key: true },
        })
      ).map((k) => k.key)
    );

    let attempts = 0;
    while (generatedKeys.length < numKeys && attempts < numKeys * 10) {
      const newKey = generateActivationKey();
      if (!existingKeys.has(newKey) && !generatedKeys.includes(newKey)) {
        generatedKeys.push(newKey);
      }
      attempts++;
    }

    if (generatedKeys.length < numKeys) {
      return NextResponse.json(
        { error: 'Could not generate enough unique keys. Try again.' },
        { status: 500 }
      );
    }

    // Create keys in database
    const createdKeys = await db.activationKey.createMany({
      data: generatedKeys.map((key) => ({
        key,
        planType,
        durationDays: parseInt(String(durationDays), 10),
        status: whatsappNumber ? 'active' : 'unused',
        linkedNumber: whatsappNumber || null,
        activatedAt: whatsappNumber ? new Date() : null,
        expiresAt: whatsappNumber
          ? new Date(Date.now() + parseInt(String(durationDays), 10) * 86400000)
          : null,
      })),
    });

    // Fetch the created keys to return full records
    const keys = await db.activationKey.findMany({
      where: { key: { in: generatedKeys } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        keys,
        count: createdKeys.count,
        message: `${createdKeys.count} key(s) generated successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating activation keys:', error);
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
}
