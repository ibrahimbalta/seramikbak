import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { room_id = 'default', points = [], labels = [] } = body || {};

    // Try forwarding to local Python SAM service if running
    try {
      const pyRes = await fetch('http://127.0.0.1:8000/api/segments/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(2000)
      });
      if (pyRes.ok) {
        return NextResponse.json(await pyRes.json());
      }
    } catch (_) {}

    // Mock / Geometric fallback when SAM service is offline
    const pt = points[0] || [400, 300];
    const x = pt[0] || 400;
    const y = pt[1] || 300;
    const bbox = [Math.max(0, x - 150), Math.max(0, y - 100), Math.min(1024, x + 150), Math.min(768, y + 100)];
    const maskUrl = `/api/segments/mask/detected?room=${encodeURIComponent(room_id)}&x=${x}&y=${y}`;

    return NextResponse.json({
      mask_url: maskUrl,
      score: 0.95,
      bbox
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
