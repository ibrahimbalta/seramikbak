import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { encryptSession } from '@/lib/session';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    // Brute-force protection: Max 20 login attempts per IP per 15 minutes
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`b2b_login_${clientIp}`, 20, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      const waitMinutes = Math.ceil(rateCheck.resetInMs / 60000);
      return NextResponse.json(
        { error: `Çok fazla başarısız giriş denemesi. Lütfen ${waitMinutes} dakika sonra tekrar deneyin.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Lütfen kullanıcı adı ve şifre girin.' }, { status: 400 });
    }

    // Find brand by username
    const brand = await prisma.brand.findUnique({
      where: { username }
    });

    if (!brand || !verifyPassword(password, brand.password)) {
      return NextResponse.json({ error: 'Hatalı kullanıcı adı veya şifre.' }, { status: 401 });
    }

    // Generate secure session token
    const token = encryptSession({
      id: brand.id,
      name: brand.name,
      role: 'brand'
    });

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set('sb_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // Successful login
    return NextResponse.json({
      success: true,
      brand: {
        id: brand.id,
        name: brand.name,
        logoUrl: brand.logoUrl
      },
      token
    });

  } catch (error) {
    console.error('B2B Login Error:', error);
    return NextResponse.json({ error: 'Giriş yapılırken sistemsel bir hata oluştu.' }, { status: 500 });
  }
}
