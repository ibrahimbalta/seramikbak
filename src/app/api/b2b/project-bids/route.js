import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const requestedBrandId = searchParams.get('brandId');
    const requestedProjectId = searchParams.get('projectId');

    // Anti-IDOR: Brand can only fetch its own bids. Admin can query any brand or project.
    let targetBrandId = null;
    if (session && session.role === 'brand') {
      targetBrandId = session.id;
    } else if (session && session.role === 'admin') {
      targetBrandId = requestedBrandId || null;
    } else if (requestedBrandId) {
      targetBrandId = requestedBrandId;
    }

    const where = {};
    if (targetBrandId) {
      where.brandId = targetBrandId;
    }
    if (requestedProjectId) {
      where.projectId = requestedProjectId;
    }

    const bids = await prisma.projectBid.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            companyName: true,
            city: true,
            quantityM2: true,
            status: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            code: true,
            imageUrl: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      }
    });

    const formattedBids = bids.map(bid => ({
      ...bid,
      projectName: bid.project?.projectName || '',
      companyName: bid.project?.companyName || '',
      productName: bid.product?.name || '',
      productCode: bid.product?.code || ''
    }));

    return NextResponse.json({
      success: true,
      bids: formattedBids
    });

  } catch (error) {
    console.error('Project Bids GET Error:', error);
    return NextResponse.json({ error: 'Proje teklifleri alınırken hata oluştu.', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await verifyAuth(request);
    if (!session || (session.role !== 'brand' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen marka girişi yapınız.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      productId,
      priceM2,
      timeline,
      note,
      brandId: bodyBrandId
    } = body;

    const brandId = session.role === 'brand' ? session.id : (bodyBrandId || session.id);

    if (!projectId || !productId || !priceM2) {
      return NextResponse.json({ error: 'Proje, ürün ve m² fiyatı zorunludur.' }, { status: 400 });
    }

    const numericPrice = parseFloat(priceM2);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ error: 'Geçerli bir m² birim fiyatı giriniz.' }, { status: 400 });
    }

    // 1. Verify project exists
    const project = await prisma.projectRequest.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: 'İlgili inşaat projesi bulunamadı.' }, { status: 404 });
    }

    // 2. Verify product belongs to this brand
    const product = await prisma.product.findFirst({
      where: { id: productId, brandId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Seçilen ürün markanıza ait değil veya bulunamadı.' }, { status: 403 });
    }

    const totalPrice = numericPrice * (project.quantityM2 || 1);

    // 3. Atomically persist ProjectBid in PostgreSQL database
    const bid = await prisma.projectBid.create({
      data: {
        projectId,
        brandId,
        productId,
        priceM2: numericPrice,
        totalPrice,
        timeline: timeline || '30 gün içinde',
        note: note || '',
        status: 'PENDING_APPROVAL'
      },
      include: {
        project: {
          select: { projectName: true, companyName: true, quantityM2: true }
        },
        product: {
          select: { name: true, code: true }
        }
      }
    });

    const formattedBid = {
      ...bid,
      projectName: bid.project?.projectName || '',
      companyName: bid.project?.companyName || '',
      productName: bid.product?.name || '',
      productCode: bid.product?.code || ''
    };

    return NextResponse.json({
      success: true,
      message: 'Proje ihaleniz başarıyla veritabanına kaydedildi ve teklif iletildi.',
      bid: formattedBid
    });

  } catch (error) {
    console.error('Project Bids POST Error:', error);
    return NextResponse.json({ error: 'Proje teklifi gönderilirken hata oluştu.', details: error.message }, { status: 500 });
  }
}
