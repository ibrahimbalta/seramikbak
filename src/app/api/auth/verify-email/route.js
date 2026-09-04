import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Doğrulama kodu bulunamadı.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Geçersiz veya kullanılmış doğrulama bağlantısı.' }, { status: 400 });
    }

    if (user.verificationTokenExpires && new Date(user.verificationTokenExpires) < new Date()) {
      return NextResponse.json({ success: false, error: 'Doğrulama bağlantısının süresi dolmuş. Lütfen tekrar doğrulama isteğinde bulunun.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'E-posta adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.'
    });
  } catch (error) {
    console.error('Verify Email API Error:', error);
    return NextResponse.json({ success: false, error: 'Doğrulama işlemi sırasında sunucu hatası oluştu.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Doğrulama tokeni gerekli.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Geçersiz doğrulama tokeni.' }, { status: 400 });
    }

    if (user.verificationTokenExpires && new Date(user.verificationTokenExpires) < new Date()) {
      return NextResponse.json({ success: false, error: 'Token süresi dolmuş.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      }
    });

    return NextResponse.json({ success: true, message: 'E-posta adresi doğrulandı.' });
  } catch (error) {
    console.error('Verify Email POST Error:', error);
    return NextResponse.json({ success: false, error: 'Sunucu hatası.' }, { status: 500 });
  }
}
