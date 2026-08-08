import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, resetToken, newPassword } = body;

    // Helper to extract base URL of current request
    const getBaseUrl = () => {
      if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
      const host = request.headers.get('host') || 'seramikbak.com';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return `${protocol}://${host}`;
    };

    // ---------------------------------------------------------
    // ACTION 1: SEND RESET LINK TO USER EMAIL
    // ---------------------------------------------------------
    if (action === 'verify_email' || !action) {
      if (!email || !email.trim()) {
        return NextResponse.json(
          { error: 'Lütfen kayıtlı e-posta adresinizi girin.' },
          { status: 400 }
        );
      }

      const trimmedEmail = email.trim().toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email: trimmedEmail }
      });

      if (!user) {
        return NextResponse.json(
          { 
            error: `Girmiş olduğunuz (${trimmedEmail}) e-posta adresi sistemimizde kayıtlı değildir. Lütfen e-posta adresinizi kontrol edin veya 'Hesap Oluştur' kısmından kayıt olun.` 
          },
          { status: 404 }
        );
      }

      // Generate secure 32-byte hex token valid for 15 minutes
      const token = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpires: tokenExpires
        }
      });

      const resetLink = `${getBaseUrl()}/uyelik?resetToken=${token}`;

      // Send email via email service
      const mailResult = await sendPasswordResetEmail({
        toEmail: user.email,
        userName: user.name,
        resetLink
      });

      if (mailResult && mailResult.success === false) {
        return NextResponse.json(
          { error: mailResult.error || 'E-posta gönderimi başarısız oldu. Lütfen tekrar deneyin.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        emailSent: true,
        message: `✓ Sn. ${user.name}, şifre sıfırlama bağlantısı e-posta adresinize (${user.email}) başarıyla gönderildi. Lütfen e-postanızın Gelen Kutusu ve Spam klasörünü kontrol edip gelen bağlantıya tıklayın.`,
        simulated: mailResult?.simulated || false
      });
    }

    // ---------------------------------------------------------
    // ACTION 2: VALIDATE TOKEN (WHEN USER CLICKS EMAIL LINK)
    // ---------------------------------------------------------
    if (action === 'validate_token') {
      if (!resetToken) {
        return NextResponse.json(
          { error: 'Geçersiz şifre sıfırlama bağlantısı.' },
          { status: 400 }
        );
      }

      const user = await prisma.user.findFirst({
        where: { resetToken }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Şifre sıfırlama bağlantısı geçersiz veya daha önce kullanılmış.' },
          { status: 400 }
        );
      }

      if (user.resetTokenExpires && new Date(user.resetTokenExpires) < new Date()) {
        return NextResponse.json(
          { error: 'Şifre sıfırlama bağlantısının süresi dolmuş (15 dakika). Lütfen tekrar şifre sıfırlama isteği gönderin.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        valid: true,
        email: user.email,
        userName: user.name
      });
    }

    // ---------------------------------------------------------
    // ACTION 3: RESET PASSWORD FOR VERIFIED TOKEN USER
    // ---------------------------------------------------------
    if (action === 'reset_password') {
      if (!resetToken) {
        return NextResponse.json(
          { error: 'Güvenlik doğrulaması eksik (Token bulunamadı). Lütfen e-postanızdaki linke tekrar tıklayın.' },
          { status: 400 }
        );
      }

      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json(
          { error: 'Lütfen en az 4 karakterden oluşan yeni şifrenizi girin.' },
          { status: 400 }
        );
      }

      const user = await prisma.user.findFirst({
        where: { resetToken }
      });

      if (!user || (user.resetTokenExpires && new Date(user.resetTokenExpires) < new Date())) {
        return NextResponse.json(
          { error: 'Şifre sıfırlama süreniz dolmuş veya bağlantı geçersiz. Lütfen tekrar şifre sıfırlama isteği gönderin.' },
          { status: 400 }
        );
      }

      const hashedPassword = hashPassword(newPassword);

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpires: null
        }
      });

      return NextResponse.json({
        success: true,
        message: `✓ Sn. ${updatedUser.name}, şifreniz başarıyla yenilendi! Hesabınıza giriş yapılıyor...`,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email
        }
      });
    }

    return NextResponse.json(
      { error: 'Geçersiz işlem parametresi.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
