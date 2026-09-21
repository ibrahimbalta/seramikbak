import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    const rateLimit = checkRateLimit(request, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla kayıt denemesi yaptınız. Lütfen bir süre sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Lütfen tüm alanları doldurun.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Lütfen geçerli bir e-posta adresi girin.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Şifreniz en az 8 karakter uzunluğunda olmalıdır.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.' },
        { status: 400 }
      );
    }

    // Create verification token (24 hours expiry)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create the user with a securely hashed password & verification token
    const hashedPassword = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: false,
        verificationToken,
        verificationTokenExpires,
      }
    });

    // Send verification email
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://seramikbak.com';
    const verificationLink = `${origin}/api/auth/verify-email?token=${verificationToken}`;
    await sendVerificationEmail({ toEmail: normalizedEmail, userName: name, verificationLink });

    return NextResponse.json({
      success: true,
      message: 'Kayıt işleminiz başarıyla tamamlandı. Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayın.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: false
      }
    });
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi başarısız oldu.', details: error.message },
      { status: 500 }
    );
  }
}

