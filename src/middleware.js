import { NextResponse } from 'next/server';

// Known malicious scanner bots & exploit tools
const SCANNER_BOTS = /sqlmap|nikto|wpscan|gobuster|dirbuster|masscan|zgrab|nmap|acunetix|nessus/i;

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  // 1. Block automated penetration testing tools & vulnerability scanners
  if (SCANNER_BOTS.test(userAgent)) {
    return new NextResponse('Access Denied: Malicious activity detected.', { status: 403 });
  }

  // 2. Block path traversal attempts
  if (pathname.includes('../') || pathname.includes('..\\') || pathname.includes('%2e%2e')) {
    return new NextResponse('Access Denied: Invalid path sequence.', { status: 400 });
  }

  // 3. Admin API Protection (First Line of Defense)
  if (pathname.startsWith('/api/admin')) {
    if (pathname === '/api/admin/cron-sync') {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('sb_session');
    const authHeader = request.headers.get('authorization');

    if (!sessionCookie?.value && (!authHeader || !authHeader.startsWith('Bearer '))) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Oturum bulunamadı.' },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.next();

  // 4. Strict Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Embeddable routes: /tasarim, /kiosk, and studio-sdk.js
  const isEmbeddable = 
    pathname.startsWith('/tasarim') || 
    pathname.startsWith('/kiosk') || 
    pathname.startsWith('/studio-sdk.js');

  if (!isEmbeddable) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  } else {
    response.headers.delete('X-Frame-Options');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
