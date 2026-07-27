import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateQuote } from '@/lib/quoteCalculator';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      dealerId,
      customerName,
      customerPhone,
      customerEmail,
      projectName,
      productId,
      productName,
      productCode,
      productImageUrl,
      areaM2,
      wastePercent,
      unitPriceM2,
      discountPercent,
      includeAdhesive,
      adhesiveUnitPriceBag,
      includeGrout,
      groutUnitPriceKg,
      laborCostTotal,
      shippingCostTotal,
      notes,
      validDays = 15
    } = body;

    if (!dealerId || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Lütfen bayi ID, müşteri adı ve telefon numarasını giriniz.' },
        { status: 400 }
      );
    }

    // 1. Calculate calculations & breakdown
    const calc = calculateQuote({
      areaM2,
      wastePercent,
      unitPriceM2,
      discountPercent,
      includeAdhesive,
      adhesiveUnitPriceBag,
      includeGrout,
      groutUnitPriceKg,
      laborCostTotal,
      shippingCostTotal
    });

    // 2. Fetch dealer info for branding
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      include: { brand: true }
    });

    const quoteId = `QT-${Date.now().toString().slice(-6)}`;
    const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString();

    const quoteData = {
      id: quoteId,
      dealerId,
      dealerName: dealer?.name || 'Yetkili Bayi',
      dealerPhone: dealer?.phone || '',
      dealerAddress: dealer?.address || '',
      dealerCity: dealer?.city || '',
      dealerLogoUrl: dealer?.logoUrl || null,
      brandName: dealer?.brand?.name || 'SeramikBak',
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      projectName: projectName || 'Banyo / Mutfak Seramik Projesi',
      productId: productId || null,
      productName: productName || 'Özel Seçim Seramik Karo',
      productCode: productCode || 'SB-CUSTOM',
      productImageUrl: productImageUrl || '/hero/hero_ceramics.jpg',
      calculations: calc,
      notes: notes || '',
      status: 'PREPARED', // PREPARED, SENT, APPROVED, REJECTED
      createdAt: new Date().toISOString(),
      expiresAt
    };

    // Log the PDF Download / Quote Created action in AnalyticsLog
    try {
      await prisma.analyticsLog.create({
        data: {
          action: 'PDF_DOWNLOAD',
          dealerId,
          productId: productId || null,
          city: dealer?.city || 'İstanbul'
        }
      });
    } catch (e) {
      console.warn('Analytics log failed for quote:', e);
    }

    return NextResponse.json({
      success: true,
      quote: quoteData,
      whatsappMessage: generateWhatsAppText(quoteData)
    });

  } catch (error) {
    console.error('Quote POST Error:', error);
    return NextResponse.json({ error: 'Teklif oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
}

function generateWhatsAppText(quote) {
  const totalStr = `₺${quote.calculations.grandTotal.toLocaleString('tr-TR')}`;
  return encodeURIComponent(
    `Sayın ${quote.customerName},\n\n` +
    `*${quote.dealerName}* tarafından hazırlanan *${quote.projectName}* projenize ait seramik & uygulama teklifiniz hazırdır.\n\n` +
    `📌 *Seçilen Seramik:* ${quote.productName}\n` +
    `📐 *Metraj (Fire Dahil):* ${quote.calculations.totalTileM2} m²\n` +
    `💰 *Genel Toplam (KDV Dahil):* ${totalStr}\n\n` +
    `Teklifinizi PDF olarak incelemek ve onaylamak için bizimle iletişime geçebilirsiniz.`
  );
}
