import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name || 'room.jpg') || '.jpg';
    const id = 'room_' + Date.now();
    const filename = `${id}${ext}`;
    const dir = path.join(process.cwd(), 'public', 'static', 'rooms');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(dir, filename), buffer);

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
