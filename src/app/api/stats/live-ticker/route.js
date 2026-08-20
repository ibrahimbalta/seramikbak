import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Fetch real outlet listings if available
    const outletListings = await prisma.outletListing.findMany({
      take: 10,
      where: { status: 'ACTIVE' },
      include: {
        dealer: { select: { name: true, city: true, district: true } },
        brand: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);

    // 2. Fetch real recent leads if available
    const recentLeads = await prisma.lead.findMany({
      take: 10,
      include: {
        product: { select: { name: true, code: true } },
        dealer: { select: { name: true, city: true } }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);

    // Build ONLY 100% real events from database
    const realOutletEvents = outletListings.map((item) => {
      const displayPrice = item.unitPrice ?? item.pricePerM2 ?? item.price;
      const priceText = displayPrice !== undefined && displayPrice !== null ? ` - ₺${displayPrice}/m²` : '';
      return {
        id: `db-out-${item.id}`,
        type: 'OUTLET_DEAL',
        badge: item.badgeTag || 'STOK İNDİRİMİ',
        color: '#fbbf24',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
        time: 'Canlı Fırsat',
        location: item.dealer?.city || 'Türkiye',
        text: `${item.brand?.name || 'Yetkili Bayi'} ${item.title}${priceText}`,
        link: '/outlet'
      };
    });

    const realLeadEvents = recentLeads.map((item) => ({
      id: `db-lead-${item.id}`,
      type: 'QUOTE_REQUEST',
      badge: 'TEKLİF TALEBİ',
      color: '#60a5fa',
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
      time: 'Yeni Teklif',
      location: item.dealer?.city || 'Şehir',
      text: `${item.product?.name || 'Seramik Ürün'} için bayi fiyat teklifi oluşturuldu`,
      link: '/proje-talep'
    }));

    const allEvents = [...realLeadEvents, ...realOutletEvents];

    return NextResponse.json({
      success: true,
      data: allEvents
    });
  } catch (error) {
    console.error('Error fetching live ticker API:', error);
    return NextResponse.json({
      success: false,
      data: []
    });
  }
}
