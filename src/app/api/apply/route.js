import { NextResponse } from 'next/server';
import { getHealthyPythonUrl, invalidatePythonCache } from '@/lib/pythonAiClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const pythonUrl = await getHealthyPythonUrl();

    // Proxy multipart form to Python FastAPI /api/apply
    const pyRes = await fetch(`${pythonUrl}/api/apply`, {
      method: 'POST',
      body: formData,
      headers: {
        'bypass-tunnel-reminder': '1',
        'Bypass-Tunnel-Reminder': 'true',
      },
      signal: AbortSignal.timeout(55000),
    });

    if (!pyRes.ok) {
      invalidatePythonCache();
      const errText = await pyRes.text();
      return NextResponse.json(
        { detail: `Apply failed (${pyRes.status}): ${errText}` },
        { status: pyRes.status }
      );
    }

    const imageBlob = await pyRes.blob();
    return new NextResponse(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    invalidatePythonCache();
    console.warn('[API /api/apply] Python server offline or unreachable:', err.message);
    return NextResponse.json(
      { success: false, offline: true, detail: 'Python AI mikroservisi çevrimdışı. İstemci motoru devrede.' },
      { status: 503 }
    );
  }
}
