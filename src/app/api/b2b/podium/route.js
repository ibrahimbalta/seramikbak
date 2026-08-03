import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function getISOWeekDetails(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { weekNumber: weekNo, year: d.getUTCFullYear() };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    const { weekNumber, year } = getISOWeekDetails();

    // Auto-expire winner active bids from past weeks
    await prisma.podiumBid.updateMany({
      where: {
        OR: [
          { year: { lt: year } },
          { year: year, weekNumber: { lt: weekNumber } }
        ],
        status: 'WINNER_ACTIVE'
      },
      data: { status: 'EXPIRED' }
    }).catch(err => console.error('Auto expire podium bids error:', err));

    // Check if there is an approved winner active bid for this week
    const activeWinner = await prisma.podiumBid.findFirst({
      where: { weekNumber, year, status: 'WINNER_ACTIVE' },
      include: {
        brand: { select: { name: true } },
        product: { select: { name: true, code: true } }
      }
    });

    // Get highest bid for current week
    const highestBidObj = activeWinner || await prisma.podiumBid.findFirst({
      where: { weekNumber, year, status: { in: ['PENDING_APPROVAL', 'WINNER_ACTIVE'] } },
      orderBy: { bidAmount: 'desc' },
      include: {
        brand: { select: { name: true } },
        product: { select: { name: true, code: true } }
      }
    });

    const highestBidAmount = highestBidObj ? highestBidObj.bidAmount : 0;
    const minNextBid = highestBidAmount > 0 ? highestBidAmount + 250 : 1500;

    // Get bids for this brand if brandId supplied
    let brandBids = [];
    if (brandId) {
      brandBids = await prisma.podiumBid.findMany({
        where: { brandId },
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, code: true, imageUrl: true } }
        }
      });
    }

    return NextResponse.json({
      success: true,
      currentWeek: weekNumber,
      currentYear: year,
      isAuctionClosed: !!activeWinner,
      highestBidAmount,
      highestBidBrand: highestBidObj?.brand?.name || null,
      highestBidProduct: highestBidObj?.product?.name || null,
      minNextBid,
      brandBids
    });
  } catch (error) {
    console.error('B2B Podium API Error:', error);
    return NextResponse.json(
      { error: 'B2B Podium fetch failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Dekont / Referans Güncelleme Aksiyonu (Onaylandıktan / Tekliften Sonra)
    if (body.action === 'submit_payment_ref') {
      const { bidId, paymentRef } = body;
      if (!bidId || !paymentRef) {
        return NextResponse.json({ error: 'Eksik parametre: bidId ve paymentRef zorunludur.' }, { status: 400 });
      }

      const updated = await prisma.podiumBid.update({
        where: { id: bidId },
        data: { paymentRef: String(paymentRef).trim() },
        include: { product: { select: { name: true, code: true } } }
      });

      return NextResponse.json({
        success: true,
        message: 'Banka dekont referans numarası başarıyla kaydedildi!',
        bid: updated
      });
    }

    // 2. Yeni Teklif Oluşturma Aksiyonu
    const { brandId, productId, bidAmount, title, description, targetWeek, targetYear } = body;

    if (!brandId || !productId || !bidAmount) {
      return NextResponse.json(
        { error: 'Eksik parametre: brandId, productId ve bidAmount zorunludur.' },
        { status: 400 }
      );
    }

    const { weekNumber: currentWeek, year: currentYear } = getISOWeekDetails();
    const weekNumber = parseInt(targetWeek || currentWeek, 10);
    const year = parseInt(targetYear || currentYear, 10);
    const numericBid = parseFloat(bidAmount);

    // KONTROL: Eğer bu hafta için onaylanmış aktif bir reklam varsa ihale KAPALIDIR! Daha yüksek teklif verilemez.
    const activeWinner = await prisma.podiumBid.findFirst({
      where: { weekNumber, year, status: 'WINNER_ACTIVE' }
    });

    if (activeWinner) {
      return NextResponse.json(
        { error: 'Bu hafta için yönetici tarafından onaylanmış aktif bir podyum reklamı bulunmaktadır. Bu haftanın reklam alanı kapatılmıştır, yeni teklif verilemez.' },
        { status: 400 }
      );
    }

    // Get current highest pending bid for this week
    const currentHighest = await prisma.podiumBid.findFirst({
      where: { weekNumber, year, status: 'PENDING_APPROVAL' },
      orderBy: { bidAmount: 'desc' }
    });

    if (currentHighest && numericBid <= currentHighest.bidAmount) {
      return NextResponse.json(
        { error: `Teklifiniz mevcut en yüksek teklif olan ₺${currentHighest.bidAmount.toLocaleString('tr-TR')} tutarından daha yüksek olmalıdır.` },
        { status: 400 }
      );
    }

    if (numericBid < 1500) {
      return NextResponse.json(
        { error: 'Minimum podyum teklif tutarı ₺1.500 TL olmalıdır.' },
        { status: 400 }
      );
    }

    // Create the new podium bid (Dekont is submitted after approval or confirmation)
    const newBid = await prisma.podiumBid.create({
      data: {
        brandId,
        productId,
        bidAmount: numericBid,
        paymentRef: body.paymentRef || '',
        title: title || 'Haftalık Podyum Özel Serisi',
        description: description || '',
        weekNumber,
        year,
        status: 'PENDING_APPROVAL'
      },
      include: {
        product: { select: { name: true, code: true, imageUrl: true } }
      }
    });

    // Mark lower pending bids for outbid status
    if (currentHighest && currentHighest.brandId !== brandId) {
      await prisma.podiumBid.updateMany({
        where: {
          weekNumber,
          year,
          id: currentHighest.id,
          status: 'PENDING_APPROVAL'
        },
        data: { status: 'OUTBID' }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Podyum reklam teklifiniz başarıyla alındı! Yönetici onayından sonra dekont bilgisi girilerek yayın aktif edilecektir.',
      bid: newBid
    });
  } catch (error) {
    console.error('B2B Podium Submit Error:', error);
    return NextResponse.json(
      { error: 'Teklif gönderilemedi.', details: error.message },
      { status: 500 }
    );
  }
}
