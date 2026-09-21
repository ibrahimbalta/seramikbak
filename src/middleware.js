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
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
