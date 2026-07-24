import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { encryptSession } from '@/lib/session';

export async function POST(request) {
  try {
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
