import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    dbStatus = 'unhealthy';
    console.error('Healthcheck DB Error:', err.message);
  }

  const memory = process.memoryUsage();
  const memoryMb = {
    rss: Math.round(memory.rss / (1024 * 1024)),
    heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
    heapUsed: Math.round(memory.heapUsed / (1024 * 1024)),
  };

  const isHealthy = dbStatus === 'healthy';

  const healthData = {
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    memory: memoryMb,
    responseTimeMs: Date.now() - startTime,
  };

  return NextResponse.json(healthData, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
