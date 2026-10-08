import { NextResponse } from 'next/server';
import { getHealthyPythonUrl, invalidatePythonCache } from '@/lib/pythonAiClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const pythonUrl = await getHealthyPythonUrl();
    
    // Proxy multipart data to Python FastAPI
    const pyRes = await fetch(`${pythonUrl}/api/segment`, {
      method: 'POST',
      body: formData,
      headers: {
        'bypass-tunnel-reminder': '1',
        'Bypass-Tunnel-Reminder': 'true',
      },
      signal: AbortSignal.timeout(50000),
    });

    if (!pyRes.ok) {
      invalidatePythonCache();
      const errText = await pyRes.text();
      return NextResponse.json(
        { detail: `Segment failed (${pyRes.status}): ${errText}` },
        { status: pyRes.status }
      );
    }

    const data = await pyRes.json();
    return NextResponse.json(data);
  } catch (err) {
    invalidatePythonCache();
    console.warn('[API /api/segment] Python server offline or unreachable:', err.message);
    return NextResponse.json(
      { success: false, offline: true, detail: 'Python AI mikroservisi çevrimdışı. İstemci motoru devrede.' },
      { status: 503 }
    );
  }
}
