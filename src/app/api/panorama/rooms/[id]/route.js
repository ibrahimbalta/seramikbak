import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid room id' }, { status: 400 });
    }
    const baseDir = path.resolve(process.cwd(), 'public', 'static', 'panorama', 'rooms');
    const roomDir = path.resolve(baseDir, id);
    if (!roomDir.startsWith(baseDir + path.sep)) {
      return NextResponse.json({ error: 'Invalid room path' }, { status: 400 });
    }
    if (!fs.existsSync(roomDir)) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    let dimensions = null;
    const layoutPath = path.join(roomDir, 'layout.json');
    if (fs.existsSync(layoutPath)) {
      try {
        dimensions = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
      } catch (_) {}
    }

    const surfaces = [];
    const files = fs.readdirSync(roomDir);
    files.forEach(file => {
      if (file.startsWith('mask_') && file.endsWith('.png')) {
        const name = file.replace(/^mask_|\.png$/g, '');
        let label = name.replace(/[_-]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (name === 'floor') label = 'Floor';
        if (name === 'ceiling') label = 'Ceiling';
        if (name.startsWith('wall_')) label = 'Wall ' + (parseInt(name.split('_')[1], 10) + 1);

        surfaces.push({
          name,
          label,
          mask_url: `/static/panorama/rooms/${id}/${file}`
        });
      }
    });

    const title = id.replace(/[_-]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return NextResponse.json({
      id,
      title,
      description: `${title} 360° panorama room.`,
      panorama_url: `/static/panorama/rooms/${id}/panorama.jpg`,
      width: 2048,
      height: 1024,
      surfaces,
      dimensions
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
