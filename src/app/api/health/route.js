import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PYTHON_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const res = await fetch(`${PYTHON_URL}/api/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Offline
  }

  return NextResponse.json({ status: 'offline', model_loaded: false }, { status: 503 });
}
