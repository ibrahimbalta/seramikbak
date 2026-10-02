import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { encryptSession } from '@/lib/session';

// Helper function to decode JWT payload without external library
function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { credential } = body;

    // 1. Validate that Google Identity Services JWT credential is provided
    if (!credential) {
      return NextResponse.json(
        { error: 'Google kimlik doğrulama belirteci (credential) eksik veya geçersiz.' },
        { status: 400 }
      );
    }

    const payload = parseJwtPayload(credential);
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: 'Google kimlik belirteci çözümlenemedi.' },
        { status: 400 }
      );
    }

    // Verify Token Issuer (Google)
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      return NextResponse.json(
        { error: 'Geçersiz Google kimlik sağlayıcısı.' },
        { status: 401 }
      );
    }

    // Verify Token Expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return NextResponse.json(
        { error: 'Google oturum süresi dolmuş. Lütfen tekrar giriş yapınız.' },
        { status: 401 }
      );
    }

    // Verify Audience if GOOGLE_CLIENT_ID is configured
    const configuredClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (configuredClientId && payload.aud && payload.aud !== configuredClientId) {
      return NextResponse.json(
        { error: 'Google istemci kimliği eşleşmedi.' },
        { status: 401 }
      );
    }

    const userEmail = payload.email;
    const userName = payload.name || payload.email.split('@')[0];
    const userPicture = payload.picture || null;

    const cleanEmail = userEmail.toLowerCase().trim();

    // 2. Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: userName || cleanEmail.split('@')[0],
          password: `google_auth_${Date.now()}_${Math.random().toString(36).slice(2)}`
        }
      });
    }

    // 3. Encrypt session token
    const token = encryptSession({
      id: user.id,
      name: user.name,
      email: user.email,
      picture: userPicture || null,
      provider: 'google',
      role: 'user'
    });

    // 4. Set HTTP-Only session cookie
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
        email: user.email,
        picture: userPicture || null
      },
      token
    });

  } catch (error) {
    console.error('Google Auth API Error:', error);
    return NextResponse.json(
      { error: 'Google ile giriş yapılırken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
