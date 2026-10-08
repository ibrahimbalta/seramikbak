import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PYTHON_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

export async function POST(req) {
  try {
    const formData = await req.formData();

    const pyRes = await fetch(`${PYTHON_URL}/api/apply`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(60000),
    });

    if (!pyRes.ok) {
      const errText = await pyRes.text();
      return NextResponse.json(
        { detail: `Apply failed (${pyRes.status}): ${errText}` },
        { status: pyRes.status }
      );
    }

    const arrayBuffer = await pyRes.arrayBuffer();
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    console.error('[API /api/apply] Error:', err);
    return NextResponse.json(
      { detail: err.message || 'Seramik dokulandırma servisine bağlanılamadı.' },
      { status: 502 }
    );
  }
}
