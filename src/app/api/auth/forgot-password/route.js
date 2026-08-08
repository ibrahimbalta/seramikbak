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

    // STRICT USER CHECK IN DATABASE
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user) {
      return NextResponse.json(
        { 
          error: `"${trimmedEmail}" adresiyle kayıtlı bir kullanıcı bulunamadı. Lütfen e-posta adresinizi doğru yazdığınızdan emin olun veya 'Hesap Oluştur' seçeneğinden ücretsiz kayıt olun.` 
        },
        { status: 404 }
      );
    }

    // ACTION 2: RESET PASSWORD FOR EXISTING VERIFIED USER
    if (action === 'reset_password') {
      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json(
          { error: 'Lütfen en az 4 karakterden oluşan yeni şifrenizi girin.' },
          { status: 400 }
        );
      }

      const hashedPassword = hashPassword(newPassword);

      // Update password strictly for existing user
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      return NextResponse.json({
        success: true,
        message: `✓ Sn. ${updatedUser.name}, şifreniz başarıyla yenilendi! Hesabınıza otomatik olarak giriş yapılıyor...`,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email
        }
      });
    }

    // ACTION 1 (DEFAULT): VERIFY REGISTERED USER EMAIL
    return NextResponse.json({
      success: true,
      verified: true,
      userName: user.name,
      message: `✓ Kayıtlı Hesap Doğrulandı: Sn. ${user.name} (${user.email}). Lütfen yeni şifrenizi belirleyin.`,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
