import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const configs = await db.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });

    const configMap: Record<string, string> = {};
    for (const config of configs) {
      configMap[config.key] = config.value;
    }

    return NextResponse.json(configMap);
  } catch (error) {
    console.error('Error fetching system config:', error);
    return NextResponse.json({
      siteName: 'WhatFlow CRM',
      siteDescription: 'WhatsApp Business Management Platform',
      supportEmail: '',
      currency: 'PKR',
      defaultPlanDuration: 'Monthly',
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'key and value are required' },
        { status: 400 }
      );
    }

    const config = await db.systemConfig.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error updating system config:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to update config: ' + errMsg }, { status: 500 });
  }
}
