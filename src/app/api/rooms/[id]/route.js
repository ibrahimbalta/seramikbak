import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req, { params }) {
  const { id } = await params;
  const dir = path.join(process.cwd(), 'public', 'static', 'rooms');
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    const match = files.find(f => path.parse(f).name === id);
    if (match) {
      return NextResponse.json({
        id,
        filename: match,
        width: 1024,
        height: 768
      });
    }
  }
  return NextResponse.json({ error: 'Room not found' }, { status: 404 });
}
