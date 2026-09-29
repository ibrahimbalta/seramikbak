import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Admin API Protection (First Line of Defense)
  if (pathname.startsWith('/api/admin')) {
    // cron-sync has its own CRON_SECRET verification
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

  // 2. Extra Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Embeddable routes: /tasarim, /kiosk, and studio-sdk.js MUST be embeddable in external iframes
  const isEmbeddable = 
    pathname.startsWith('/tasarim') || 
    pathname.startsWith('/kiosk') || 
    pathname.startsWith('/studio-sdk.js');

  if (!isEmbeddable) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  } else {
    // Remove X-Frame-Options to allow embedding on partner/brand websites and local test HTML
    response.headers.delete('X-Frame-Options');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com; frame-src 'self' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; img-src 'self' data: blob: https: https://*.googleusercontent.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: https://accounts.google.com; worker-src 'self' blob:; frame-ancestors *;"
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
