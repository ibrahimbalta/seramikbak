import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { productId, dealerId, clientName, clientPhone, clientEmail, city, district, address, notes } = body;

    if (!productId || !clientName || !clientPhone || !clientEmail || !city || !address) {
      return NextResponse.json(
        { error: 'Lütfen ürün, ad soyad, telefon, e-posta, şehir ve teslimat adresini eksiksiz doldurunuz.' },
        { status: 400 }
      );
    }

    const sampleOrder = await prisma.sampleOrder.create({
      data: {
        productId,
        dealerId: dealerId || null,
        clientName,
        clientPhone,
        clientEmail,
        city,
        district: district || '',
        address,
        notes: notes || '',
        status: 'PENDING'
      },
      include: {
        product: {
          select: { name: true, imageUrl: true, brand: { select: { name: true } } }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Numune karo talebiniz başarıyla alındı! En kısa sürede kargoya verilip bilgilendirileceksiniz.',
      sampleOrder
    });
  } catch (error) {
    console.error('Sample Order API Create Error:', error);
    return NextResponse.json(
      { error: 'Numune siparişi oluşturulurken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
