import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { encryptSession } from '@/lib/session';

export async function POST(request) {
  try {
    const body = await request.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone || !password) {
      return NextResponse.json({ error: 'Lütfen kullanıcı adı (e-posta/telefon) ve şifre girin.' }, { status: 400 });
    }

    // Find dealer by email or phone
    const dealer = await prisma.dealer.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone }
        ]
      },
      include: {
        brand: { select: { name: true } }
      }
    });

    if (!dealer || !verifyPassword(password, dealer.password)) {
      return NextResponse.json({ error: 'Hatalı e-posta/telefon veya şifre.' }, { status: 401 });
    }

    if (dealer.status === 'PENDING_APPROVAL') {
      return NextResponse.json({ 
        error: 'Bayi kaydınız henüz onaylanmamıştır. Lütfen sistem yöneticisinin onaylamasını bekleyin.' 
      }, { status: 403 });
    }

    if (dealer.status === 'REJECTED') {
      return NextResponse.json({ 
        error: 'Bayi başvuru talebiniz reddedilmiştir.' 
      }, { status: 403 });
    }

    // Generate secure session token
    const token = encryptSession({
      id: dealer.id,
      name: dealer.name,
      email: dealer.email,
      role: 'dealer'
    });

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set('sb_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // Successful login
    return NextResponse.json({
      success: true,
      dealer: {
        id: dealer.id,
        name: dealer.name,
        email: dealer.email,
        phone: dealer.phone,
        brandId: dealer.brandId,
        brandName: dealer.brand?.name || '',
        city: dealer.city,
        district: dealer.district,
        address: dealer.address,
        lat: dealer.lat,
        lng: dealer.lng,
        logoUrl: dealer.logoUrl,
        showroomImages: dealer.showroomImages,
        virtualTourUrl: dealer.virtualTourUrl,
        specialConcepts: dealer.specialConcepts
      },
      token
    });

  } catch (error) {
    console.error('Dealer Login Error:', error);
    return NextResponse.json({ error: 'Giriş yapılırken sistemsel bir hata oluştu.' }, { status: 500 });
  }
}
