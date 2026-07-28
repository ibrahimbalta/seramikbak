import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, city = 'ALL', category = 'ALL' } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Lütfen adınız ve WhatsApp telefon numaranızı girin.' }, { status: 400 });
    }

    // Clean and normalize phone number
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Geçerli bir telefon numarası giriniz (Örn: 0532 123 45 67).' }, { status: 400 });
    }

    // Create or update subscription
    const alert = await prisma.outletAlert.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        city: city || 'ALL',
        category: category || 'ALL',
        status: 'ACTIVE'
      }
    });

    // Count subscribers for this city
    const cityCount = await prisma.outletAlert.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { city: city },
          { city: 'ALL' }
        ]
      }
    });

    return NextResponse.json({
      success: true,
      alert,
      cityCount,
      message: `${city === 'ALL' ? 'Tüm Türkiye' : city} için WhatsApp Fırsat Bildirimi başarıyla aktifleştirildi!`
    });

  } catch (error) {
    console.error('Outlet Alert Subscribe Error:', error);
    return NextResponse.json({ error: 'Abonelik oluşturulurken sistemsel bir hata oluştu.' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'ALL';

    const cityCount = await prisma.outletAlert.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { city: city },
          { city: 'ALL' }
        ]
      }
    });

    const totalCount = await prisma.outletAlert.count({
      where: { status: 'ACTIVE' }
    });

    return NextResponse.json({
      success: true,
      cityCount,
      totalCount
    });
  } catch (error) {
    console.error('Outlet Alert GET Error:', error);
    return NextResponse.json({ error: 'Veri çekilirken hata oluştu.' }, { status: 500 });
  }
}
