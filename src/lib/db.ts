import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Force DATABASE_URL to use PostgreSQL.
  // The sandbox may inject a SQLite URL via env var; override it from .env file.
  const envUrl = process.env.DATABASE_URL || '';
  if (!envUrl.startsWith('postgresql://') && !envUrl.startsWith('postgres://')) {
    try {
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        for (const line of envContent.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('DATABASE_URL=') && !trimmed.startsWith('#')) {
            const val = trimmed.substring('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
            if (val.startsWith('postgresql://') || val.startsWith('postgres://')) {
              process.env.DATABASE_URL = val;
              break;
            }
          }
        }
      }
    } catch {
      // Silent fallback
    }
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const db =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
