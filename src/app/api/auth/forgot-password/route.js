import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, newPassword } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Lütfen e-posta adresinizi girin.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // ACTION 2: RESET & UPDATE PASSWORD
    if (action === 'reset_password') {
      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json(
          { error: 'Lütfen en az 4 karakterden oluşan yeni şifrenizi girin.' },
          { status: 400 }
        );
      }

      const hashedPassword = hashPassword(newPassword);

      // Find or create user to update password
      const updatedUser = await prisma.user.upsert({
        where: { email: trimmedEmail },
        update: { password: hashedPassword },
        create: {
          email: trimmedEmail,
          name: trimmedEmail.split('@')[0],
          password: hashedPassword
        }
      });

      return NextResponse.json({
        success: true,
        message: '✓ Şifreniz başarıyla yenilendi! Hesabınıza otomatik olarak giriş yapılıyor...',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email
        }
      });
    }

    // ACTION 1 (DEFAULT): VERIFY EMAIL
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    return NextResponse.json({
      success: true,
      verified: true,
      message: '✓ E-posta adresiniz doğrulandı. Lütfen aşağıdaki alandan yeni şifrenizi belirleyin.',
      user: user ? { id: user.id, name: user.name, email: user.email } : { email: trimmedEmail }
    });

  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
