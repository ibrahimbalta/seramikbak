import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendInstallerNotification } from '@/lib/email';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    const where = {
      status: 'ACTIVE'
    };

    if (city && city !== 'ALL') {
      where.city = city;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { specialties: { contains: search, mode: 'insensitive' } }
      ];
    }

    const installers = await prisma.installer.findMany({
      where,
      orderBy: [
        { verified: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      count: installers.length,
      installers
    });
  } catch (error) {
    console.error('GET /api/installers Error:', error);
    return NextResponse.json({ success: false, error: 'Ustalar yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      companyName,
      phone,
      city,
      district,
      experienceYears,
      specialties,
      notes,
      guaranteeBadge,
      contractRateM2,
      portfolioBeforeAfter
    } = body;

    if (!name || !phone || !city) {
      return NextResponse.json({ success: false, error: 'Lütfen Ad-Soyad, Telefon ve Şehir alanlarını doldurun.' }, { status: 400 });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json({ success: false, error: 'Lütfen geçerli bir telefon numarası giriniz.' }, { status: 400 });
    }

    // Safe portfolio JSON string validation
    let safePortfolio = null;
    if (portfolioBeforeAfter) {
      safePortfolio = typeof portfolioBeforeAfter === 'string' ? portfolioBeforeAfter : JSON.stringify(portfolioBeforeAfter);
      // Hard guard: 3MB max string to prevent database bloat
      if (safePortfolio.length > 3 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: 'Yüklenen şantiye görsellerinin boyutu çok büyük. Lütfen daha küçük görseller seçiniz.' }, { status: 413 });
      }
    }

    const installer = await prisma.installer.create({
      data: {
        name: name.trim(),
        companyName: companyName ? companyName.trim() : null,
        phone: cleanPhone,
        city: city.trim(),
        district: district ? district.trim() : null,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : 10,
        specialties: specialties ? specialties.trim() : 'Seramik, Granit, Banyo & Zemin Döşeme',
        notes: notes ? notes.trim() : null,
        guaranteeBadge: guaranteeBadge !== undefined ? Boolean(guaranteeBadge) : true,
        contractRateM2: contractRateM2 ? contractRateM2.trim() : '280 ₺/m²',
        portfolioBeforeAfter: safePortfolio,
        verified: false, // Pending admin review
        rating: 5.0,
        reviewCount: 1,
        status: 'ACTIVE'
      }
    });

    // Safely trigger email notification (non-blocking, won't break registration if email fails)
    try {
      sendInstallerNotification({
        name: name.trim(),
        phone: cleanPhone,
        city: city.trim(),
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : 10,
        specialties: specialties || 'Seramik Döşeme'
      }).catch(err => {
        console.error('Installer email notification trigger error:', err);
      });
    } catch (mailErr) {
      console.error('sendInstallerNotification sync error:', mailErr);
    }

    return NextResponse.json({
      success: true,
      installer,
      message: 'Seramik ustası başvurunuz başarıyla alındı! Profiliniz incelendikten sonra rehberde yayınlanacaktır.'
    });
  } catch (error) {
    console.error('POST /api/installers Error:', error);
    return NextResponse.json({ success: false, error: 'Kayıt sırasında sistemsel bir hata oluştu: ' + (error?.message || 'Lütfen tekrar deneyin.') }, { status: 500 });
  }
}
