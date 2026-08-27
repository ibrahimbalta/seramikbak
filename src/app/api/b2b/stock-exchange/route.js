import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Realistic B2B seed data for demonstration if DB is fresh
const INITIAL_B2B_OFFERS = [
  {
    id: 'b2b-seed-1',
    type: 'NEED_STOCK',
    productName: 'Calacatta Gold 60x120 Rektifiyeli Porselen',
    brandName: 'NG Kütahya Seramik',
    quantityM2: 24,
    city: 'İstanbul',
    district: 'Kadıköy',
    urgent: true,
    notes: 'Müşteri banyo projesi için eksik kaldı, acil teslim alabiliriz.',
    contactName: 'Yıldız Yapı / Mehmet Bey',
    contactPhone: '05321234567',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'b2b-seed-2',
    type: 'HAVE_STOCK',
    productName: 'Calacatta Gold 60x120 Rektifiyeli Porselen',
    brandName: 'NG Kütahya Seramik',
    quantityM2: 60,
    city: 'İstanbul',
    district: 'Ümraniye',
    urgent: false,
    notes: 'Depoda fazla stok var, takasa veya uygun fiyata teslime hazır.',
    contactName: 'Anadolu Seramik / Ali Bey',
    contactPhone: '05339876543',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'b2b-seed-3',
    type: 'NEED_STOCK',
    productName: 'Marmara Beyazı 80x80 Parlak Karo',
    brandName: 'VitrA',
    quantityM2: 40,
    city: 'Ankara',
    district: 'Çankaya',
    urgent: true,
    notes: 'Villa projesine 40 m2 daha lazım, fabrika siparişi beklenemiyor.',
    contactName: 'Başkent Yapı / Hakan Bey',
    contactPhone: '05355554433',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'b2b-seed-4',
    type: 'HAVE_STOCK',
    productName: 'Natural Oak 20x120 Ahşap Dokulu Seramik',
    brandName: 'Bien Seramik',
    quantityM2: 120,
    city: 'İzmir',
    district: 'Karşıyaka',
    urgent: false,
    notes: 'Seri sonu fazla stok. Çapraz bayi takasına açık.',
    contactName: 'Ege Dekores / Murat Bey',
    contactPhone: '05307778899',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'NEED_STOCK' | 'HAVE_STOCK' | 'MY_OFFERS' | 'ALL'
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const dealerId = searchParams.get('dealerId');
    const phone = searchParams.get('phone');
    const statusParam = searchParams.get('status'); // 'OPEN' | 'MATCHED' | 'CLOSED' | 'ALL'

    const where = {};

    // By default show OPEN status unless explicitly asked or filtering by owner
    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam;
    } else if (!statusParam && !dealerId && !phone) {
      where.status = 'OPEN';
    }

    if (type && type !== 'ALL' && type !== 'MY_OFFERS') {
      where.type = type;
    }

    if (city && city !== 'ALL') {
      where.city = city;
    }

    if (dealerId || phone) {
      const ownerConditions = [];
      if (dealerId) ownerConditions.push({ dealerId });
      if (phone) {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        if (cleanPhone) {
          ownerConditions.push({ contactPhone: { contains: cleanPhone.slice(-7) } });
        }
      }
      if (ownerConditions.length > 0) {
        where.OR = ownerConditions;
      }
    }

    if (search) {
      const searchOR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { brandName: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } }
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    let offers = await prisma.dealerStockExchange.findMany({
      where,
      orderBy: [
        { urgent: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Fallback seed offers if DB table is clean and no specific dealerId requested
    if (offers.length === 0 && !dealerId && !phone) {
      let filteredSeed = INITIAL_B2B_OFFERS;
      if (type && type !== 'ALL' && type !== 'MY_OFFERS') filteredSeed = filteredSeed.filter(o => o.type === type);
      if (city && city !== 'ALL') filteredSeed = filteredSeed.filter(o => o.city === city);
      if (search) {
        const s = search.toLowerCase();
        filteredSeed = filteredSeed.filter(o => 
          o.productName.toLowerCase().includes(s) || 
          o.brandName.toLowerCase().includes(s) || 
          o.contactName.toLowerCase().includes(s)
        );
      }
      offers = filteredSeed;
    }

    return NextResponse.json({
      success: true,
      count: offers.length,
      offers
    });
  } catch (error) {
    console.error('GET /api/b2b/stock-exchange Error:', error);
    return NextResponse.json({ success: false, error: 'Stok borsa ilanları alınırken bir hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      type, // 'NEED_STOCK' | 'HAVE_STOCK'
      productName,
      brandName,
      quantityM2,
      city,
      district,
      urgent,
      notes,
      contactName,
      contactPhone,
      dealerId
    } = body;

    if (!productName || !contactName || !contactPhone || !city) {
      return NextResponse.json({
        success: false,
        error: 'Lütfen Seramik Ürün Adı, Şehir, İletişim Kişisi ve Telefon numarası alanlarını doldurun.'
      }, { status: 400 });
    }

    const cleanPhone = contactPhone.replace(/[^\d+]/g, '');

    const offer = await prisma.dealerStockExchange.create({
      data: {
        type: type || 'NEED_STOCK',
        productName: productName.trim(),
        brandName: brandName ? brandName.trim() : 'Genel Seramik Markası',
        quantityM2: quantityM2 ? parseInt(quantityM2, 10) : 10,
        city: city.trim(),
        district: district ? district.trim() : null,
        urgent: urgent !== undefined ? Boolean(urgent) : true,
        notes: notes ? notes.trim() : null,
        contactName: contactName.trim(),
        contactPhone: cleanPhone,
        dealerId: dealerId || null,
        status: 'OPEN'
      }
    });

    return NextResponse.json({
      success: true,
      offer,
      message: 'B2B Stok Takas İlanınız başarıyla yayınlandı! Diğer bayiler size doğrudan ulaşabilecek.'
    });
  } catch (error) {
    console.error('POST /api/b2b/stock-exchange Error:', error);
    return NextResponse.json({ success: false, error: 'İlan kaydedilirken bir hata oluştu.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      type,
      productName,
      brandName,
      quantityM2,
      city,
      district,
      urgent,
      notes,
      contactName,
      contactPhone,
      status
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'İlan ID zorunludur.' }, { status: 400 });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;
    if (productName !== undefined) updateData.productName = productName.trim();
    if (brandName !== undefined) updateData.brandName = brandName ? brandName.trim() : 'Genel Seramik Markası';
    if (quantityM2 !== undefined) updateData.quantityM2 = parseInt(quantityM2, 10) || 10;
    if (city !== undefined) updateData.city = city.trim();
    if (district !== undefined) updateData.district = district ? district.trim() : null;
    if (urgent !== undefined) updateData.urgent = Boolean(urgent);
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;
    if (contactName !== undefined) updateData.contactName = contactName.trim();
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone.replace(/[^\d+]/g, '');

    const updated = await prisma.dealerStockExchange.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, offer: updated, message: 'İlan başarıyla güncellendi.' });
  } catch (error) {
    console.error('PUT /api/b2b/stock-exchange Error:', error);
    return NextResponse.json({ success: false, error: 'İlan güncelleme hatası.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Silinecek ilan ID\'si gereklidir.' }, { status: 400 });
    }

    await prisma.dealerStockExchange.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'İlan başarıyla silindi.' });
  } catch (error) {
    console.error('DELETE /api/b2b/stock-exchange Error:', error);
    return NextResponse.json({ success: false, error: 'İlan silinirken bir hata oluştu.' }, { status: 500 });
  }
}
