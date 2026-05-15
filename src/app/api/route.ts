import { NextResponse } from "next/server";
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ 
      status: "ok",
      message: "WhatFlow CRM API is running",
      database: "connected"
    });
  } catch {
    return NextResponse.json({ 
      status: "degraded",
      message: "WhatFlow CRM API is running (database not connected)",
      database: "disconnected"
    });
  }
}
