import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      productId,
      dealerId,
      clientName,
      clientPhone,
      clientEmail,
      surfaceType, // 'WALL' or 'FLOOR'
      grossAreaM2,
      cutoutAreaM2,
      netAreaM2,
      boxCount,
      adhesiveBags,
      groutKg,
      notes
    } = body;

    if (!productId || !clientPhone || !clientName) {
      return NextResponse.json(
        { error: 'Ad Soyad, Telefon ve Ürün seçimi zorunludur.' },
        { status: 400 }
      );
    }

    // Default to a fallback dealer if none specified
    let targetDealerId = dealerId;
    if (!targetDealerId) {
      const firstDealer = await prisma.dealer.findFirst({
        where: { status: 'APPROVED' }
      });
      targetDealerId = firstDealer?.id || null;
    }

    if (!targetDealerId) {
      return NextResponse.json(
        { error: 'Sistemde aktif bayi bulunamadı.' },
        { status: 404 }
      );
    }

    // Dimension breakdown summary
    const dimensionSummary = `AR LiDAR Taraması [${surfaceType === 'WALL' ? 'Duvar' : 'Zemin'}]: Brüt ${grossAreaM2}m², Düşülen Boşluk ${cutoutAreaM2}m², Net ${netAreaM2}m² (${boxCount} Kutu, ${adhesiveBags} Çuval Yapıştırıcı, ${groutKg}kg Derz)`;

    const lead = await prisma.lead.create({
      data: {
        productId,
        dealerId: targetDealerId,
        clientName,
        clientPhone,
        clientEmail: clientEmail || 'ar-scanner@seramikbak.com',
        projectDimensions: dimensionSummary,
        notes: notes ? `${notes} | ${dimensionSummary}` : dimensionSummary,
        status: 'PENDING'
      },
      include: {
        product: { select: { name: true, code: true, imageUrl: true } },
        dealer: { select: { name: true, phone: true, city: true, district: true } }
      }
    });

    // Also record analytics log for AR Scan
    await prisma.analyticsLog.create({
      data: {
        action: 'AR_SCAN',
        productId,
        dealerId: targetDealerId,
        query: `AR_SCAN_${surfaceType}_${netAreaM2}M2`
      }
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      lead,
      message: 'AR Ölçüm talebiniz ve teklif kaydınız başarıyla oluşturuldu.'
    });

  } catch (error) {
    console.error('AR Scan Lead Error:', error);
    return NextResponse.json(
      { error: 'AR Ölçüm kaydı oluşturulurken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}
