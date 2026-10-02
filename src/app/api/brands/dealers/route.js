import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const queryBrandId = searchParams.get('brandId');

    let targetBrandId = null;

    if (session && session.role === 'brand') {
      targetBrandId = session.id;
    } else if (session && session.role === 'admin') {
      targetBrandId = queryBrandId || null;
    } else if (queryBrandId) {
      targetBrandId = queryBrandId;
    }

    if (!targetBrandId) {
      return NextResponse.json({ error: 'Marka kimliği (brandId) belirtilmelidir.' }, { status: 400 });
    }

    // Verify brand exists
    const brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { id: targetBrandId },
          { slug: targetBrandId }
        ]
      },
      select: { id: true, name: true, slug: true }
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marka bulunamadı.' }, { status: 404 });
    }

    // Fetch all dealers registered for this brand (including pending approval)
    const dealers = await prisma.dealer.findMany({
      where: {
        brandId: brand.id
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        district: true,
        lat: true,
        lng: true,
        status: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
        saas: {
          select: {
            plan: true,
            status: true,
            expiresAt: true
          },
          take: 1,
          orderBy: { expiresAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(dealers);
  } catch (error) {
    console.error('[Brand Dealers GET Error]:', error);
    return NextResponse.json({ error: 'Bayi listesi alınırken hata oluştu.', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await verifyAuth(request);
    if (!session || (session.role !== 'brand' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapınız.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, brandId: bodyBrandId } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Bayi ID ve durum (status) zorunludur.' }, { status: 400 });
    }

    let targetBrandId = null;
    if (session.role === 'brand') {
      targetBrandId = session.id;
    } else if (session.role === 'admin') {
      targetBrandId = bodyBrandId || null; // Admin can update any dealer or specific brand's dealer
    }

    const whereCondition = { id };
    if (targetBrandId) {
      whereCondition.brandId = targetBrandId;
    }

    const dealer = await prisma.dealer.findFirst({
      where: whereCondition
    });

    if (!dealer) {
      return NextResponse.json({ error: 'Yetkiniz dahilinde bayi bulunamadı.' }, { status: 404 });
    }

    const updated = await prisma.dealer.update({
      where: { id: dealer.id },
      data: { status }
    });

    return NextResponse.json({ success: true, dealer: updated });
  } catch (error) {
    console.error('[Brand Dealers PUT Error]:', error);
    return NextResponse.json({ error: 'Bayi durumu güncellenirken hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await verifyAuth(request);
    if (!session || (session.role !== 'brand' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapınız.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, email, password, address, city, district, lat, lng, brandId: bodyBrandId } = body;

    let targetBrandId = null;
    if (session.role === 'brand') {
      targetBrandId = session.id;
    } else if (session.role === 'admin') {
      targetBrandId = bodyBrandId;
    }

    if (!name || !targetBrandId || !phone || !address || !city || !district) {
      return NextResponse.json({ error: 'Lütfen zorunlu tüm alanları doldurun.' }, { status: 400 });
    }

    const latitude = parseFloat(lat) || 40.9901;
    const longitude = parseFloat(lng) || 29.0278;

    const initialPassword = password && password.trim() !== '' 
      ? (password.includes(':') ? password : hashPassword(password)) 
      : hashPassword('bayi123');

    const newDealer = await prisma.dealer.create({
      data: {
        name,
        brandId: targetBrandId,
        phone,
        email: email || null,
        password: initialPassword,
        status: 'APPROVED',
        address,
        city,
        district,
        lat: latitude,
        lng: longitude
      }
    });

    return NextResponse.json({ success: true, dealer: newDealer });
  } catch (error) {
    console.error('[Brand Dealers POST Error]:', error);
    return NextResponse.json({ error: 'Bayi kaydı oluşturulamadı.', details: error.message }, { status: 500 });
  }
}
