import { NextResponse } from 'next/server';

function isPrivateOrLocalHost(hostname) {
  if (!hostname) return true;
  const lower = hostname.toLowerCase();

  // Localhost checks
  if (lower === 'localhost' || lower.endsWith('.localhost') || lower === '127.0.0.1' || lower === '::1' || lower === '0.0.0.0') {
    return true;
  }

  // Cloud metadata endpoint
  if (lower === '169.254.169.254' || lower.startsWith('169.254.')) {
    return true;
  }

  // RFC1918 Private IPv4 Ranges
  if (lower.startsWith('10.') || lower.startsWith('192.168.')) {
    return true;
  }
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(lower)) {
    return true;
  }

  // CGNAT range (100.64.0.0/10)
  if (/^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./.test(lower)) {
    return true;
  }

  return false;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  let parsedUrl;
  try {
    if (url.startsWith('/')) {
      const origin = new URL(request.url).origin;
      parsedUrl = new URL(url, origin);
    } else {
      parsedUrl = new URL(url);
    }
  } catch {
    return new NextResponse('Invalid URL format', { status: 400 });
  }

  // 1. Enforce HTTP/HTTPS only (block file://, gopher://, dict://, etc.)
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return new NextResponse('Unsupported protocol', { status: 400 });
  }

  // 2. Block private/internal network addresses (SSRF Protection)
  if (isPrivateOrLocalHost(parsedUrl.hostname)) {
    return new NextResponse('Forbidden target host', { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return new NextResponse(`Failed to fetch image: ${res.statusText}`, { status: res.status });
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    
    // 3. Ensure we only proxy safe image content types (reject HTML, JS, JSON to prevent XSS)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    const isImage = allowedTypes.some(t => contentType.includes(t));
    if (!isImage) {
      return new NextResponse('Target response is not an allowed image format', { status: 415 });
    }

    const buffer = await res.arrayBuffer();

    // Max 15MB proxy response payload limit
    if (buffer.byteLength > 15 * 1024 * 1024) {
      return new NextResponse('Image payload exceeds maximum allowed size (15MB)', { status: 413 });
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-Content-Type-Options': 'nosniff'
      },
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return new NextResponse('Request timeout', { status: 504 });
    }
    console.error('Image proxy error:', error.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
