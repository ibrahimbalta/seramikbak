import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { encryptSession } from '@/lib/session';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, password, officeName, name, phone, city, title, chamberNo, isDemo } = body;

    // 1. DEMO ARCHITECT LOGIN (Quick Test)
    if (action === 'demo' || isDemo) {
      let demoArchitect = await prisma.architect.findFirst({
        where: { email: 'demo.mimar@tabanlioglu.com' }
      });

      if (!demoArchitect) {
        demoArchitect = await prisma.architect.create({
          data: {
            officeName: 'Tabanlıoğlu Mimarlık & Tasarım',
            name: 'Murat Tabanlıoğlu',
            title: 'Yüksek Mimar',
            email: 'demo.mimar@tabanlioglu.com',
            phone: '0212 251 34 50',
            password: hashPassword('Demo1234!'),
            city: 'İstanbul',
            address: 'Levent Mah. Cömert Sk. No:1 Beşiktaş / İstanbul',
            chamberNo: 'TMMOB-34821',
            website: 'https://tabanlioglu.com',
            status: 'APPROVED'
          }
        });

        // Add sample demo projects
        const firstProducts = await prisma.product.findMany({ take: 6 });
        
        const demoProj1 = await prisma.architectProject.create({
          data: {
            architectId: demoArchitect.id,
            title: 'Bodrum Luxury Bay Resort Hotel',
            projectType: 'Otel',
            city: 'Muğla / Bodrum',
            totalAreaM2: 12500,
            status: 'SPEC_IN',
            notes: 'Ana lobi zeminleri, spa ıslak hacimleri ve sahil süitleri için geniş ebat mermer ve traverten dokulu porselen seramik şartnamesi.'
          }
        });

        const demoProj2 = await prisma.architectProject.create({
          data: {
            architectId: demoArchitect.id,
            title: 'Bağdat Caddesi Rezidans Projesi',
            projectType: 'Konut',
            city: 'İstanbul / Kadıköy',
            totalAreaM2: 3200,
            status: 'DESIGN',
            notes: 'Banyo zemin ve duvarlarında mat yüzey 60x120 ve teraslarda R11 kaymaz seramik uygulaması.'
          }
        });

        // Add products to projects if available
        if (firstProducts.length > 0) {
          await prisma.architectProjectItem.create({
            data: {
              projectId: demoProj1.id,
              productId: firstProducts[0].id,
              usageArea: 'Lobi & Fuaye Zemin',
              areaM2: 2400,
              notes: 'Rektifiye 120x240 plaka porselen'
            }
          });

          if (firstProducts[1]) {
            await prisma.architectProjectItem.create({
              data: {
                projectId: demoProj1.id,
                productId: firstProducts[1].id,
                usageArea: 'Spa & Islak Hacim',
                areaM2: 850,
                notes: 'R10 kaymazlık sınıfı'
              }
            });
          }

          if (firstProducts[2]) {
            await prisma.architectProjectItem.create({
              data: {
                projectId: demoProj2.id,
                productId: firstProducts[2].id,
                usageArea: 'Ebeveyn Banyo Duvar',
                areaM2: 450,
                notes: 'Doğal taş rölyef doku'
              }
            });
          }
        }
      }

      const token = encryptSession({
        id: demoArchitect.id,
        name: demoArchitect.name,
        officeName: demoArchitect.officeName,
        email: demoArchitect.email,
        role: 'architect'
      });

      const cookieStore = await cookies();
      cookieStore.set('sb_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });

      return NextResponse.json({
        success: true,
        architect: {
          id: demoArchitect.id,
          officeName: demoArchitect.officeName,
          name: demoArchitect.name,
          email: demoArchitect.email,
          title: demoArchitect.title,
          city: demoArchitect.city
        },
        token
      });
    }

    // 2. REGISTER NEW ARCHITECT (Requires Admin Approval like Dealers)
    if (action === 'register') {
      if (!email || !password || !officeName || !name || !phone) {
        return NextResponse.json({ error: 'Lütfen tüm zorunlu alanları doldurun.' }, { status: 400 });
      }

      const existing = await prisma.architect.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (existing) {
        return NextResponse.json({ error: 'Bu e-posta adresi ile kayıtlı bir mimar hesabı zaten mevcut.' }, { status: 409 });
      }

      const newArchitect = await prisma.architect.create({
        data: {
          officeName: officeName.trim(),
          name: name.trim(),
          title: title ? title.trim() : 'Mimar',
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password: hashPassword(password),
          city: city ? city.trim() : 'İstanbul',
          chamberNo: chamberNo ? chamberNo.trim() : null,
          status: 'PENDING_APPROVAL'
        }
      });

      // DO NOT set login session cookie! Inform user about admin approval
      return NextResponse.json({
        success: true,
        pendingApproval: true,
        message: 'Mimarlık ofisi başvurunuz başarıyla alındı. Sistem yöneticisi onayının ardından hesabınız aktifleşecek ve giriş yapabileceksiniz.'
      });
    }

    // 3. LOGIN ARCHITECT
    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gereklidir.' }, { status: 400 });
    }

    const architect = await prisma.architect.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!architect || !verifyPassword(password, architect.password)) {
      return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
    }

    // Check approval status
    if (architect.status === 'PENDING_APPROVAL') {
      return NextResponse.json({
        error: 'Mimar / Ofis kaydınız henüz onaylanmamıştır. Sistem yöneticisi onayının ardından portala erişebilirsiniz.'
      }, { status: 403 });
    }

    if (architect.status === 'REJECTED') {
      return NextResponse.json({
        error: 'Mimarlık ofisi başvuru talebiniz sistem yöneticisi tarafından reddedilmiştir.'
      }, { status: 403 });
    }

    const token = encryptSession({
      id: architect.id,
      name: architect.name,
      officeName: architect.officeName,
      email: architect.email,
      role: 'architect'
    });

    const cookieStore = await cookies();
    cookieStore.set('sb_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return NextResponse.json({
      success: true,
      architect: {
        id: architect.id,
        officeName: architect.officeName,
        name: architect.name,
        email: architect.email,
        title: architect.title,
        city: architect.city,
        status: architect.status
      },
      token
    });

  } catch (err) {
    console.error('Architect Auth Error:', err);
    return NextResponse.json({ error: 'İşlem sırasında hata oluştu: ' + err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const architectId = searchParams.get('id');

    if (!architectId) {
      return NextResponse.json({ error: 'architectId gerekli.' }, { status: 400 });
    }

    const architect = await prisma.architect.findUnique({
      where: { id: architectId },
      select: {
        id: true,
        officeName: true,
        name: true,
        title: true,
        email: true,
        phone: true,
        city: true,
        address: true,
        chamberNo: true,
        website: true,
        createdAt: true
      }
    });

    if (!architect) {
      return NextResponse.json({ error: 'Mimar profili bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, architect });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
