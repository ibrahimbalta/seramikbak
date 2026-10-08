import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow sufficient time for neural model inference

const PYTHON_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

/**
 * Resolves an image input (base64 data URL, local public path, or HTTP URL) into a Buffer and mimeType.
 */
async function resolveImageBuffer(imgInput) {
  if (!imgInput) return null;

  // Case 1: Base64 Data URL
  if (imgInput.startsWith('data:')) {
    const parts = imgInput.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const buffer = Buffer.from(parts[1], 'base64');
    return { buffer, mimeType };
  }

  // Case 2: Local public path (e.g. /textures/calacatta_gold.jpg or /hero/easy_bathroom.jpg)
  if (imgInput.startsWith('/')) {
    const localPath = path.join(process.cwd(), 'public', imgInput);
    if (fs.existsSync(localPath)) {
      const buffer = fs.readFileSync(localPath);
      const ext = path.extname(localPath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      return { buffer, mimeType };
    }
  }

  // Case 3: HTTP/HTTPS remote URL
  if (imgInput.startsWith('http://') || imgInput.startsWith('https://')) {
    const res = await fetch(imgInput, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Görsel indirilemedi: ${imgInput} (${res.status})`);
    const arrayBuffer = await res.arrayBuffer();
    const mimeType = res.headers.get('content-type') || 'image/jpeg';
    return { buffer: Buffer.from(arrayBuffer), mimeType };
  }

  // Fallback: Raw base64 string
  const buffer = Buffer.from(imgInput, 'base64');
  return { buffer, mimeType: 'image/jpeg' };
}

/**
 * GET: Health Check
 */
export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${PYTHON_URL}/api/health`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        online: true,
        modelLoaded: Boolean(data.model_loaded),
        engine: 'SegFormer-B3 Python Microservice'
      });
    }
  } catch (err) {
    // Service offline
  }

  return NextResponse.json({
    success: true,
    online: false,
    engine: 'Client Canvas/WebGL Engine (Fallback)'
  });
}

/**
 * POST: Segment or Apply Tiles
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      action = 'apply', 
      room_image, 
      tile_image, 
      mask, 
      pattern = 'grid', 
      tile_scale = 1.0, 
      surface = 'floor' 
    } = body;

    if (!room_image) {
      return NextResponse.json(
        { success: false, error: 'Oda görseli (room_image) gereklidir.' },
        { status: 400 }
      );
    }

    // Step A: Segment Surface
    if (action === 'segment') {
      const roomResolved = await resolveImageBuffer(room_image);
      if (!roomResolved) {
        return NextResponse.json({ success: false, error: 'Oda görseli çözümlenemedi.' }, { status: 400 });
      }

      const form = new FormData();
      form.append(
        'hall_image', 
        new Blob([roomResolved.buffer], { type: roomResolved.mimeType }), 
        'room.jpg'
      );
      form.append('surface', surface || 'floor');

      const segRes = await fetch(`${PYTHON_URL}/api/segment`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(30000)
      });

      if (!segRes.ok) {
        const errText = await segRes.text();
        return NextResponse.json(
          { success: false, error: `Python segment hatası (${segRes.status}): ${errText}` },
          { status: segRes.status }
        );
      }

      const segData = await segRes.json();
      return NextResponse.json({
        success: true,
        mask: segData.mask,
        width: segData.width,
        height: segData.height,
        surface
      });
    }

    // Step B: Apply Tile Texture & Blend
    if (action === 'apply') {
      if (!tile_image) {
        return NextResponse.json({ success: false, error: 'Seramik görseli (tile_image) gereklidir.' }, { status: 400 });
      }

      const [roomResolved, tileResolved] = await Promise.all([
        resolveImageBuffer(room_image),
        resolveImageBuffer(tile_image)
      ]);

      if (!roomResolved || !tileResolved) {
        return NextResponse.json({ success: false, error: 'Görseller çözümlenemedi.' }, { status: 400 });
      }

      // If mask was not provided by client, auto-generate mask via Python first
      let activeMask = mask;
      if (!activeMask) {
        const segForm = new FormData();
        segForm.append('hall_image', new Blob([roomResolved.buffer], { type: roomResolved.mimeType }), 'room.jpg');
        segForm.append('surface', surface || 'floor');

        const segRes = await fetch(`${PYTHON_URL}/api/segment`, {
          method: 'POST',
          body: segForm,
          signal: AbortSignal.timeout(30000)
        });
        if (segRes.ok) {
          const segData = await segRes.json();
          activeMask = segData.mask;
        } else {
          return NextResponse.json({ success: false, error: 'Zemin segmentasyonu oluşturulamadı.' }, { status: 500 });
        }
      }

      const applyForm = new FormData();
      applyForm.append('hall_image', new Blob([roomResolved.buffer], { type: roomResolved.mimeType }), 'room.jpg');
      applyForm.append('tile_image', new Blob([tileResolved.buffer], { type: tileResolved.mimeType }), 'tile.jpg');
      applyForm.append('mask', activeMask);
      applyForm.append('pattern', pattern === 'brick' || pattern === 'staggered_50' ? 'brick' : 'grid');
      applyForm.append('tile_scale', String(Math.max(0.1, Math.min(5.0, Number(tile_scale) || 1.0))));
      applyForm.append('surface', surface || 'floor');

      const applyRes = await fetch(`${PYTHON_URL}/api/apply`, {
        method: 'POST',
        body: applyForm,
        signal: AbortSignal.timeout(45000)
      });

      if (!applyRes.ok) {
        const errText = await applyRes.text();
        return NextResponse.json(
          { success: false, error: `Python apply hatası (${applyRes.status}): ${errText}` },
          { status: applyRes.status }
        );
      }

      const resultBuffer = Buffer.from(await applyRes.arrayBuffer());
      const renderedBase64 = `data:image/png;base64,${resultBuffer.toString('base64')}`;

      return NextResponse.json({
        success: true,
        renderedImage: renderedBase64,
        mask: activeMask,
        engine: 'SegFormer-B3 Python Microservice'
      });
    }

    return NextResponse.json({ success: false, error: `Bilinmeyen eylem: ${action}` }, { status: 400 });
  } catch (err) {
    console.error('[Python Visualizer API] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Python görselleştirme servisi çalışırken hata oluştu.' },
      { status: 500 }
    );
  }
}
