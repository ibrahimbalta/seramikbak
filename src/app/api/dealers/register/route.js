import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, brandId, phone, email, password, address, city, district, lat, lng } = body;

    if (!name || !brandId || !phone || !address || !city || !district || !password) {
      return NextResponse.json({ error: 'Lütfen zorunlu tüm alanları doldurun.' }, { status: 400 });
    }

    // Check if dealer with same phone or email already exists
    if (email) {
      const existingEmail = await prisma.dealer.findFirst({
        where: { email }
      });
      if (existingEmail) {
        return NextResponse.json({ error: 'Bu e-posta adresiyle kayıtlı bir bayi zaten mevcut.' }, { status: 400 });
      }
    }

    const existingPhone = await prisma.dealer.findFirst({
      where: { phone }
    });
    if (existingPhone) {
      return NextResponse.json({ error: 'Bu telefon numarasıyla kayıtlı bir bayi zaten mevcut.' }, { status: 400 });
    }

    const latitude = parseFloat(lat) || 40.9901;
    const longitude = parseFloat(lng) || 29.0278;

    const newDealer = await prisma.dealer.create({
      data: {
        name,
        brandId,
        phone,
        email: email || null,
        password,
        status: 'PENDING_APPROVAL',
        address,
        city,
        district,
        lat: latitude,
        lng: longitude
      }
    });

    return NextResponse.json({ success: true, dealer: newDealer });
  } catch (error) {
    console.error('Dealer Register Error:', error);
    return NextResponse.json({ error: 'Kayıt sırasında bir hata oluştu.', details: error.message }, { status: 500 });
  }
}
