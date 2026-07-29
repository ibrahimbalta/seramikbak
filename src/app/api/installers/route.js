import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
      notes
    } = body;

    if (!name || !phone || !city) {
      return NextResponse.json({ success: false, error: 'Lütfen Ad-Soyad, Telefon ve Şehir alanlarını doldurun.' }, { status: 400 });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/[^\d+]/g, '');

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
        verified: false, // Pending admin approval
        rating: 5.0,
        reviewCount: 1,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({
      success: true,
      installer,
      message: 'Seramik ustası başvurunuz başarıyla alındı! Yönetici onayından sonra profiliniz rehberde yayınlanacaktır.'
    });
  } catch (error) {
    console.error('POST /api/installers Error:', error);
    return NextResponse.json({ success: false, error: 'Kayıt sırasında sistemsel bir hata oluştu.' }, { status: 500 });
  }
}
