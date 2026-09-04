import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Lütfen tüm alanları doldurun.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
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
        email,
        password: hashedPassword,
        emailVerified: false,
        verificationToken,
        verificationTokenExpires,
      }
    });

    // Send verification email
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://seramikbak.com';
    const verificationLink = `${origin}/api/auth/verify-email?token=${verificationToken}`;
    await sendVerificationEmail({ toEmail: email, userName: name, verificationLink });

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

