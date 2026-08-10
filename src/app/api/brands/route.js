import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const customOrder = [
  "Çanakkale Seramik",
  "NG Kütahya Seramik",
  "VitrA",
  "Bien Seramik",
  "Yurtbay Seramik",
  "Seramiksan",
  "Ege Seramik",
  "Qua Granite",
  "Duratiles",
  "DuraTiles"
];

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true
      }
    });

    brands.sort((a, b) => {
      const indexA = customOrder.findIndex(name => name.toLowerCase() === a.name.toLowerCase());
      const indexB = customOrder.findIndex(name => name.toLowerCase() === b.name.toLowerCase());
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) {
        return -1;
      }
      if (indexB !== -1) {
        return 1;
      }
      return a.name.localeCompare(b.name, 'tr');
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Brands API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const { name, contactPerson, email, phone, note } = payload;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Lütfen Marka Adı, E-Posta ve Telefon alanlarını doldurun.' }, { status: 400 });
    }

    // Record brand lead request in DB
    const lead = await prisma.lead.create({
      data: {
        name: contactPerson || name,
        phone,
        email,
        city: 'MARKA_BASVURU',
        district: name,
        notes: `[B2B MARKA BAŞVURUSU] Firma: ${name} | İletişim: ${contactPerson || '-'} | Not: ${note || '-'}`
      }
    });

    console.log(`[Yeni Marka Katılım Başvurusu] ${name} (${email}) - ID: ${lead.id}`);

    return NextResponse.json({
      success: true,
      message: 'Marka katılım başvurunuz başarıyla alındı. Müşteri temsilcimiz 24 saat içinde sizinle iletişime geçecektir.',
      id: lead.id
    });
  } catch (error) {
    console.error('Brand Register API Error:', error);
    return NextResponse.json({ error: 'Başvuru kaydedilemedi', details: error.message }, { status: 500 });
  }
}

