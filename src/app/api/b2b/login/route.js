import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';

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

    // Successful login
    return NextResponse.json({
      success: true,
      brand: {
        id: brand.id,
        name: brand.name,
        logoUrl: brand.logoUrl
      }
    });

  } catch (error) {
    console.error('B2B Login Error:', error);
    return NextResponse.json({ error: 'Giriş yapılırken sistemsel bir hata oluştu.' }, { status: 500 });
  }
}
