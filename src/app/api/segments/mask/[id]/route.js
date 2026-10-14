import { NextResponse } from 'next/server';
import zlib from 'zlib';

function createGrayscalePng(width, height, isWhitePx) {
  // Color type 0 (grayscale), 8-bit depth
  const rawData = Buffer.alloc(height * (1 + width));
  let ptr = 0;
  for (let y = 0; y < height; y++) {
    rawData[ptr++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      rawData[ptr++] = isWhitePx(x, y, width, height) ? 255 : 0;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  const calcCrc = (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  };

  const makeChunk = (type, data) => {
    const len = data.length;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    const crc = calcCrc(chunk.subarray(4, 8 + len));
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  };

  // IHDR data (13 bytes)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 0; // Grayscale
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

export async function GET(req, { params }) {
  const { id } = await params;
  const url = new URL(req.url);
  const type = id.toLowerCase();
  const w = 1024;
  const h = 768;

  let isWhitePx;
  if (type.includes('floor')) {
    isWhitePx = (x, y, width, height) => y > height * 0.62;
  } else if (type.includes('ceiling')) {
    isWhitePx = (x, y, width, height) => y < height * 0.20;
  } else if (type.includes('wall')) {
    isWhitePx = (x, y, width, height) => y >= height * 0.20 && y <= height * 0.62;
  } else {
    const clickX = parseInt(url.searchParams.get('x') || '512', 10);
    const clickY = parseInt(url.searchParams.get('y') || '384', 10);
    isWhitePx = (x, y) => Math.abs(x - clickX) < 150 && Math.abs(y - clickY) < 100;
  }

  const pngBuffer = createGrayscalePng(w, h, isWhitePx);

  return new NextResponse(pngBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
