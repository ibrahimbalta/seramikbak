import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');

    if (!dealerId) {
      return NextResponse.json({ success: false, error: 'Bayi ID zorunludur.' }, { status: 400 });
    }

    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { city: true, name: true }
    });

    if (!dealer) {
      return NextResponse.json({ success: false, error: 'Bayi bulunamadı.' }, { status: 404 });
    }

    const dealerCity = dealer.city || 'ALL';

    const subscribers = await prisma.outletAlert.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { city: dealerCity },
          { city: 'ALL' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({
      success: true,
      city: dealerCity,
      dealerName: dealer.name,
      count: subscribers.length,
      subscribers
    });
  } catch (error) {
    console.error('GET /api/dealers/outlet/subscribers Error:', error);
    return NextResponse.json({ success: false, error: 'Alıcı takibi yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}
