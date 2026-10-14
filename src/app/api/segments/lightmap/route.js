import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Return a 1x1 neutral gray or transparent png
    // 1x1 PNG neutral
    const neutralPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    return new NextResponse(neutralPng, {
      status: 200,
      headers: {
        'Content-Type': 'image/png'
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
