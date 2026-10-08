import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PYTHON_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    // Proxy multipart data to Python FastAPI
    const pyRes = await fetch(`${PYTHON_URL}/api/segment`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(45000),
    });

    if (!pyRes.ok) {
      const errText = await pyRes.text();
      return NextResponse.json(
        { detail: `Segment failed (${pyRes.status}): ${errText}` },
        { status: pyRes.status }
      );
    }

    const data = await pyRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn('[API /api/segment] Python server offline or unreachable:', err.message);
    return NextResponse.json(
      { success: false, offline: true, detail: 'Python AI mikroservisi çevrimdışı. İstemci motoru devrede.' },
      { status: 503 }
    );
  }
}
