import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { encryptSession } from '@/lib/session';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Lütfen e-posta ve şifrenizi girin.' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: 'E-posta veya şifre hatalı.' },
        { status: 401 }
      );
    }

    // Generate secure session token
    const token = encryptSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'admin'
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'Giriş işlemi başarısız oldu.' },
      { status: 500 }
    );
  }
}
