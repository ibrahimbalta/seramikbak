import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { encryptSession } from '@/lib/session';
import { hashPassword } from '@/lib/auth';

let cachedCerts = null;
let cachedCertsExpiresAt = 0;

async function getGoogleJwks() {
  if (cachedCerts && Date.now() < cachedCertsExpiresAt) {
    return cachedCerts;
  }
  const res = await fetch('https://www.googleapis.com/oauth2/v3/certs', {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    throw new Error('Google JWKS anahtarları alınamadı.');
  }
  const data = await res.json();
  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSec = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;
  cachedCerts = Array.isArray(data.keys) ? data.keys : [];
  cachedCertsExpiresAt = Date.now() + maxAgeSec * 1000;
  return cachedCerts;
}

function decodeBase64UrlJson(segment) {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}

async function verifyGoogleIdToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  let header, payload;
  try {
    header = decodeBase64UrlJson(headerB64);
    payload = decodeBase64UrlJson(payloadB64);
  } catch {
    return null;
  }

  if (header.alg !== 'RS256' || !header.kid) {
    return null;
  }

  const keys = await getGoogleJwks();
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    cachedCertsExpiresAt = 0;
    const freshKeys = await getGoogleJwks();
    jwk = freshKeys.find((k) => k.kid === header.kid);
  }
  if (!jwk) return null;

  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const signingInput = Buffer.from(`${headerB64}.${payloadB64}`, 'utf8');
  const sigBase64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
  const sigPadded = sigBase64 + '='.repeat((4 - (sigBase64.length % 4)) % 4);
  const signature = Buffer.from(sigPadded, 'base64');

  const isValid = crypto.verify('RSA-SHA256', signingInput, publicKey, signature);
  if (!isValid) return null;

  return payload;
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

    const payload = await verifyGoogleIdToken(credential);
    if (!payload || !payload.email || payload.email_verified !== true) {
      return NextResponse.json(
        { error: 'Google kimlik belirteci doğrulanamadı.' },
        { status: 401 }
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
    if (!payload.exp || Date.now() >= payload.exp * 1000) {
      return NextResponse.json(
        { error: 'Google oturum süresi dolmuş. Lütfen tekrar giriş yapınız.' },
        { status: 401 }
      );
    }

    // Verify Audience if GOOGLE_CLIENT_ID is configured
    const configuredClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (configuredClientId && payload.aud !== configuredClientId) {
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
          emailVerified: true,
          password: hashPassword(crypto.randomBytes(32).toString('hex'))
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
