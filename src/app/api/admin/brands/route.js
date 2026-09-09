import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-check';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request, 'admin');
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        username: true,
        password: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            dealers: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Admin Brands API Error:', error);
    return NextResponse.json({ error: 'Markalar alınırken bir hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request, 'admin');
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    // --- CASE 1: CREATE NEW BRAND ---
    if (action === 'create' || (!id && body.name)) {
      const name = body.name?.trim();
      if (!name) {
        return NextResponse.json({ error: 'Marka adı zorunludur.' }, { status: 400 });
      }

      // Check if brand name already exists (case-insensitive)
      const existingBrand = await prisma.brand.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' }
        }
      });

      if (existingBrand) {
        return NextResponse.json({ error: `"${name}" isimli bir marka zaten mevcut.` }, { status: 400 });
      }

      // Generate a clean username if not provided
      let cleanUsername = (body.username || name.toLowerCase().replace(/[^a-z0-9]/g, '')).trim();
      if (!cleanUsername) {
        cleanUsername = 'marka' + Math.floor(1000 + Math.random() * 9000);
      }

      // Ensure username uniqueness
      const existingUser = await prisma.brand.findUnique({
        where: { username: cleanUsername }
      });
      if (existingUser) {
        cleanUsername = `${cleanUsername}${Math.floor(100 + Math.random() * 900)}`;
      }

      // Generate or hash password
      const rawPassword = body.password?.trim() || `sb${Math.floor(100000 + Math.random() * 900000)}`;
      const finalPassword = rawPassword.includes(':') ? rawPassword : hashPassword(rawPassword);

      const createdBrand = await prisma.brand.create({
        data: {
          name,
          logoUrl: body.logoUrl?.trim() || null,
          username: cleanUsername,
          password: finalPassword
        }
      });

      // Auto-assign active SaaS Enterprise config so brand is ready
      try {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 2);
        await prisma.saaSConfig.create({
          data: {
            brandId: createdBrand.id,
            plan: 'ENTERPRISE_GLOBAL_EXPORTS',
            status: 'ACTIVE',
            expiresAt
          }
        });
      } catch (saasErr) {
        console.warn('Auto SaaS config notice:', saasErr.message);
      }

      return NextResponse.json({
        success: true,
        message: `"${createdBrand.name}" markası başarıyla oluşturuldu.`,
        brand: {
          id: createdBrand.id,
          name: createdBrand.name,
          logoUrl: createdBrand.logoUrl,
          username: createdBrand.username,
          password: rawPassword
        }
      });
    }

    // --- CASE 2: UPDATE EXISTING BRAND ---
    if (!id) {
      return NextResponse.json({ error: 'Güncellenecek marka ID bilgisi eksik.' }, { status: 400 });
    }

    const { username, password, name, logoUrl } = body;

    // If username is being updated, check if taken by another brand
    if (username) {
      const existing = await prisma.brand.findFirst({
        where: {
          username: username.trim(),
          NOT: { id }
        }
      });

      if (existing) {
        return NextResponse.json({ error: 'Bu kullanıcı adı başka bir marka tarafından kullanılıyor.' }, { status: 400 });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl ? logoUrl.trim() : null;
    if (username) updateData.username = username.trim();
    if (password) {
      updateData.password = password.includes(':') ? password : hashPassword(password);
    }

    const updated = await prisma.brand.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Marka bilgileri başarıyla güncellendi.',
      brand: { id: updated.id, name: updated.name }
    });
  } catch (error) {
    console.error('Admin Brands API Error:', error);
    return NextResponse.json({ error: error.message || 'Sistem hatası.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request, 'admin');
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Silinecek marka ID belirtilmedi.' }, { status: 400 });
    }

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, dealers: true }
        }
      }
    });

    if (!brand) {
      return NextResponse.json({ error: 'Marka bulunamadı.' }, { status: 404 });
    }

    await prisma.brand.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: `"${brand.name}" markası başarıyla silindi.`
    });
  } catch (error) {
    console.error('Admin Brands Delete Error:', error);
    return NextResponse.json({ error: 'Marka silinirken hata oluştu.' }, { status: 500 });
  }
}
