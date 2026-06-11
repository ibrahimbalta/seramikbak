import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    if (!dealer || dealer.password !== password) {
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
        lng: dealer.lng
      }
    });

  } catch (error) {
    console.error('Dealer Login Error:', error);
    return NextResponse.json({ error: 'Giriş yapılırken sistemsel bir hata oluştu.' }, { status: 500 });
  }
}
