import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const zipPath = path.join(process.cwd(), 'public', 'WhatFlow-Fix.zip');
  
  if (!fs.existsSync(zipPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(zipPath);
  
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="WhatFlow-CRM-Fix.zip"',
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
