import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Fetch real outlet listings if available
    const outletListings = await prisma.outletListing.findMany({
      take: 6,
      where: { status: 'ACTIVE' },
      include: {
        dealer: { select: { name: true, city: true, district: true } },
        brand: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);

    // 2. Fetch real recent leads if available
    const recentLeads = await prisma.lead.findMany({
      take: 6,
      include: {
        product: { select: { name: true, code: true } },
        dealer: { select: { name: true, city: true } }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);

    // 3. Fallback / Curated Realistic Marketplace Social Proof Stream
    const curatedEvents = [
      {
        id: 'ev-1',
        type: 'QUOTE_REQUEST',
        badge: 'TEKLİF TALEBİ',
        color: '#60a5fa',
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.3)',
        time: '2 dk önce',
        location: 'İzmir / Karşıyaka',
        text: 'Bir müşteri 60x120 Mermer Serisi için 3 bayiden teklif istedi',
        link: '/teklif-al'
      },
      {
        id: 'ev-2',
        type: 'OUTLET_DEAL',
        badge: 'STOK İNDİRİMİ',
        color: '#fbbf24',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
        time: '4 dk önce',
        location: 'İstanbul / Kadıköy',
        text: 'VitrA Yetkili Bayisi 50 m² stok fazlası Calacatta porselende %35 indirim tanımladı',
        link: '/outlet'
      },
      {
        id: 'ev-3',
        type: 'SAMPLE_SHIPMENT',
        badge: 'NUMUNE KARGO',
        color: '#34d399',
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.3)',
        time: '5 dk önce',
        location: 'Ankara / Çankaya',
        text: 'Kütahya Seramik Bayisi adrese ücretsiz numune karo gönderimi başlattı',
        link: '/numune-talep'
      },
      {
        id: 'ev-4',
        type: 'ARCHITECT_CAD',
        badge: 'MİMARİ DOKU',
        color: '#c084fc',
        bg: 'rgba(168, 85, 247, 0.1)',
        border: 'rgba(168, 85, 247, 0.3)',
        time: '8 dk önce',
        location: 'Bursa / Nilüfer',
        text: 'Bir mimarlık ofisi otel projesi için DWG ve 3D doku ZIP paketini indirdi',
        link: '/mimar-portali'
      },
      {
        id: 'ev-5',
        type: 'QUOTE_REQUEST',
        badge: 'TEKLİF TALEBİ',
        color: '#60a5fa',
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.3)',
        time: '12 dk önce',
        location: 'Antalya / Muratpaşa',
        text: 'Bien Seramik 120x240 Traverten Plaka için toplu metraj fiyatı sorgulandı',
        link: '/teklif-al'
      },
      {
        id: 'ev-6',
        type: 'OUTLET_DEAL',
        badge: 'FIRSAT STOK',
        color: '#fbbf24',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
        time: '15 dk önce',
        location: 'Kocaeli / Gebze',
        text: 'Qua Seramik Beton Gri 60x60 seri sonu ürünleri m² ₺290’dan listelendi',
        link: '/outlet'
      }
    ];

    // Combine real DB listings if available
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
      link: '/teklif-al'
    }));

    const allEvents = [...realLeadEvents, ...realOutletEvents, ...curatedEvents];

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
