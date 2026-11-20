import { NextResponse } from 'next/server';
import dns from 'node:dns';
import net from 'node:net';

// Server-side in-memory LRU texture buffer cache for instant (<1ms) repeat 3D texture delivery
const PROXY_CACHE = new Map();
const MAX_PROXY_CACHE_ITEMS = 120;
const PROXY_CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function getCachedProxyEntry(key) {
  const entry = PROXY_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > PROXY_CACHE_TTL_MS) {
    PROXY_CACHE.delete(key);
    return null;
  }
  // Refresh LRU order
  PROXY_CACHE.delete(key);
  PROXY_CACHE.set(key, entry);
  return entry;
}

function setCachedProxyEntry(key, buffer, contentType) {
  if (buffer.byteLength > 2 * 1024 * 1024) return; // Only cache textures <= 2MB in RAM
  if (PROXY_CACHE.size >= MAX_PROXY_CACHE_ITEMS) {
    const oldestKey = PROXY_CACHE.keys().next().value;
    if (oldestKey) PROXY_CACHE.delete(oldestKey);
  }
  PROXY_CACHE.set(key, {
    buffer,
    contentType,
    timestamp: Date.now()
  });
}

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

  const cacheKey = parsedUrl.toString();
  const cached = getCachedProxyEntry(cacheKey);
  if (cached) {
    return new NextResponse(cached.buffer, {
      headers: {
        'Content-Type': cached.contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
        'X-Proxy-Cache': 'HIT'
      }
    });
  }

  // 2. Block private/internal network addresses (SSRF Protection)
  async function assertSafeTarget(targetUrlObj) {
    if (targetUrlObj.protocol !== 'http:' && targetUrlObj.protocol !== 'https:') {
      return { ok: false, status: 400, msg: 'Unsupported protocol' };
    }
    if (isPrivateOrLocalHost(targetUrlObj.hostname)) {
      return { ok: false, status: 403, msg: 'Forbidden target host' };
    }
    // Resolve DNS to block DNS rebinding / wildcard DNS pointing to private/loopback IPs
    if (!net.isIP(targetUrlObj.hostname)) {
      try {
        const records = await dns.promises.lookup(targetUrlObj.hostname, { all: true });
        if (!records || records.length === 0) {
          return { ok: false, status: 403, msg: 'Unresolvable target host' };
        }
        for (const rec of records) {
          if (isPrivateOrLocalHost(rec.address)) {
            return { ok: false, status: 403, msg: 'Forbidden target host (private IP resolution)' };
          }
        }
      } catch {
        return { ok: false, status: 403, msg: 'Target host DNS lookup failed' };
      }
    }
    return { ok: true };
  }

  const initialCheck = await assertSafeTarget(parsedUrl);
  if (!initialCheck.ok) {
    return new NextResponse(initialCheck.msg, { status: initialCheck.status });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s fast timeout

    let currentUrl = parsedUrl;
    let res = null;
    const maxRedirects = 2;
    for (let hop = 0; hop <= maxRedirects; hop++) {
      res = await fetch(currentUrl.toString(), {
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': `${currentUrl.origin}/`
        }
      });

      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc || hop === maxRedirects) {
          clearTimeout(timeoutId);
          return new NextResponse('Too many or invalid redirects', { status: 403 });
        }
        try {
          currentUrl = new URL(loc, currentUrl.toString());
        } catch {
          clearTimeout(timeoutId);
          return new NextResponse('Invalid redirect URL', { status: 400 });
        }
        const hopCheck = await assertSafeTarget(currentUrl);
        if (!hopCheck.ok) {
          clearTimeout(timeoutId);
          return new NextResponse(hopCheck.msg, { status: hopCheck.status });
        }
        continue;
      }
      break;
    }
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

    setCachedProxyEntry(cacheKey, buffer, contentType);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
        'X-Proxy-Cache': 'MISS'
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
