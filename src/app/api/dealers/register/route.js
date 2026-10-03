import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    // Abuse protection: Max 5 dealer registrations per IP per 15 minutes
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`dealer_reg_${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      const waitMinutes = Math.ceil(rateCheck.resetInMs / 60000);
      return NextResponse.json(
        { error: `Çok fazla kayıt denemesi yapıldı. Lütfen ${waitMinutes} dakika sonra tekrar deneyin.` },
        { status: 429 }
      );
    }

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

    const hashedPassword = hashPassword(password);
    const newDealer = await prisma.dealer.create({
      data: {
        name,
        brandId,
        phone,
        email: email || null,
        password: hashedPassword,
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
