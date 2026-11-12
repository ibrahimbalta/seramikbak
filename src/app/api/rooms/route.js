import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'static', 'rooms');
    if (!fs.existsSync(dir)) {
      return NextResponse.json({ rooms: [] });
    }
    const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    const rooms = files.map(f => {
      const id = path.parse(f).name;
      return {
        id,
        filename: f,
        width: 1024,
        height: 768
      };
    });
    return NextResponse.json({ rooms });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`rooms_upload_${clientIp}`, 20, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Çok fazla dosya yükleme denemesi.' }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = path.extname(file.name || '').toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ error: 'Yalnızca JPEG, PNG ve WebP görsellerine izin verilir.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 10MB sınırını aşamaz.' }, { status: 413 });
    }

    const id = 'room_' + Date.now();
    const filename = `${id}${ext}`;
    const dir = path.resolve(process.cwd(), 'public', 'static', 'rooms');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const targetPath = path.resolve(dir, filename);
    if (!targetPath.startsWith(dir + path.sep)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    fs.writeFileSync(targetPath, buffer);

    return NextResponse.json({
      id,
      filename,
      width: 1024,
      height: 768
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
