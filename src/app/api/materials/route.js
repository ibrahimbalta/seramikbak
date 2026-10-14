import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'static', 'textures');
    if (!fs.existsSync(dir)) {
      return NextResponse.json({ materials: [] });
    }
    const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    const materials = files.map(f => {
      const id = path.parse(f).name;
      const name = id.replace(/[_-]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        id,
        name,
        width_mm: 600,
        height_mm: 1200,
        thumbnail_url: `/static/textures/${f}`,
        texture_url: `/static/textures/${f}`
      };
    });
    return NextResponse.json({ materials });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
