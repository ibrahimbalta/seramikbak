import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';

// Helper to mask phone for privacy & KVKK (e.g. 0532 *** ** 89)
function maskPhone(phone) {
  if (!phone) return '***';
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.length < 7) return '*** ***';
  return clean.slice(0, 4) + ' *** ** ' + clean.slice(-2);
}

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'dealer' && auth.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim. Lütfen giriş yapınız.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    // Anti-IDOR: Regular dealers can only access alerts for their own showroom/city
    const dealerId = auth.role === 'dealer' ? auth.id : (searchParams.get('dealerId') || auth.id);

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

    // Mask phone numbers to protect subscriber privacy (KVKK)
    const maskedSubscribers = subscribers.map(s => ({
      id: s.id,
      name: s.name,
      phone: maskPhone(s.phone),
      city: s.city,
      category: s.category,
      status: s.status,
      createdAt: s.createdAt
    }));

    return NextResponse.json({
      success: true,
      city: dealerCity,
      dealerName: dealer.name,
      count: maskedSubscribers.length,
      subscribers: maskedSubscribers
    });
  } catch (error) {
    console.error('GET /api/dealers/outlet/subscribers Error:', error);
    return NextResponse.json({ success: false, error: 'Alıcı takibi yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}
