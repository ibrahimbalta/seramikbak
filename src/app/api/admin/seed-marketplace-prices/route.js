import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const products = await prisma.product.findMany({
      take: 400,
      orderBy: { id: 'asc' },
      include: { brand: true }
    });

    let updated = 0;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const isMegaSlab = p.width >= 120 && p.height >= 240;
      if (isMegaSlab) continue;

      const baseM2Price = Math.round(
        280 + 
        (p.finish === 'Parlak' || p.finish === 'Full Lappato' ? 140 : 60) + 
        (p.style === 'Mermer' ? 120 : p.style === 'Ahşap' ? 90 : 50) +
        ((i * 17) % 180)
      );

      const tyPrice = Math.round(baseM2Price * 0.96);
      const hbPrice = Math.round(baseM2Price * 1.02);
      const kcPrice = (i % 2 === 0) ? Math.round(baseM2Price * 0.98) : null;
      const yedPrice = (i % 3 === 0) ? Math.round(baseM2Price * 1.05) : null;

      const brandName = p.brand?.name || 'Seramik';
      const cleanName = encodeURIComponent(`${brandName} ${p.name}`);

      await prisma.product.update({
        where: { id: p.id },
        data: {
          trendyolPrice: tyPrice,
          trendyolUrl: p.trendyolUrl || `https://www.trendyol.com/sr?q=${cleanName}`,
          hepsiburadaPrice: hbPrice,
          hepsiburadaUrl: p.hepsiburadaUrl || `https://www.hepsiburada.com/ara?q=${cleanName}`,
          koctasPrice: kcPrice,
          koctasUrl: kcPrice ? (p.koctasUrl || `https://www.koctas.com.tr/search?q=${cleanName}`) : null,
          yerevdekorPrice: yedPrice,
          yerevdekorUrl: yedPrice ? (p.yerevdekorUrl || `https://www.yerevdekor.com/arama?q=${cleanName}`) : null
        }
      });
      updated++;
    }

    return NextResponse.json({
      success: true,
      message: `Vercel / Turso canlı veritabanında ${updated} ürün için pazaryeri fiyatları güncellendi.`,
      updated
    });
  } catch (error) {
    console.error('Seed Marketplace Prices Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
