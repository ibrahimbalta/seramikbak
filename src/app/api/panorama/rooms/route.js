import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'static', 'panorama', 'rooms');
    if (!fs.existsSync(dir)) {
      return NextResponse.json({ rooms: [], default_id: null });
    }
    const folders = fs.readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    const rooms = folders.map(f => {
      const title = f.replace(/[_-]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        id: f,
        title,
        description: `${title} 360° panorama room.`,
        panorama_url: `/static/panorama/rooms/${f}/panorama.jpg`,
        thumbnail_url: `/static/panorama/rooms/${f}/panorama.jpg`
      };
    });

    return NextResponse.json({
      rooms,
      default_id: rooms[0]?.id || null
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
