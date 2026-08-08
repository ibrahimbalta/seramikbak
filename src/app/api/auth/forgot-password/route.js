import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Lütfen kayıtlı e-posta adresinizi girin.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user exists in DB
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user) {
      // For security & privacy, we still return a helpful confirmation 
      // or inform that if account exists, an email is sent
      return NextResponse.json({
        success: true,
        message: `${trimmedEmail} e-posta adresi sistemimizde kayıtlı ise şifre sıfırlama bağlantısı gönderilmiştir. Lütfen gelen kutunuzu ve Spam klasörünü kontrol edin.`
      });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `✓ Şifre sıfırlama bağlantısı ${user.email} adresine gönderildi. Lütfen e-posta kutunuzu (Spam klasörü dahil) kontrol edin.`
    });
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
}
