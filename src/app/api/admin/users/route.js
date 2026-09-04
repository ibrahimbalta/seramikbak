import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';
import { hashPassword } from '@/lib/auth';

// GET: List all Admin Users (SUPER_ADMIN only)
export async function GET(request) {
  try {
    const authSession = await verifyAuth(request, 'admin', 'SUPER_ADMIN');
    if (!authSession) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Bu alana sadece Süper Admin erişebilir.' }, { status: 403 });
    }

    const adminUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, users: adminUsers });
  } catch (error) {
    console.error('Admin Users GET Error:', error);
    return NextResponse.json({ error: 'Yöneticiler listelenirken hata oluştu.' }, { status: 500 });
  }
}

// POST: Create a new Admin Sub-Account (SUPER_ADMIN only)
export async function POST(request) {
  try {
    const authSession = await verifyAuth(request, 'admin', 'SUPER_ADMIN');
    if (!authSession) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Yeni yönetici ekleme yetkisi sadece Süper Admin hesabı ile mümkündür.' }, { status: 403 });
    }

    const { username, email, name, password, role } = await request.json();

    if (!username || !email || !name || !password) {
      return NextResponse.json({ error: 'Lütfen kullanıcı adı, e-posta, isim ve şifre alanlarını doldurun.' }, { status: 400 });
    }

    const existingAdmin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'Bu kullanıcı adı veya e-posta adresi zaten kullanımda.' }, { status: 400 });
    }

    const validRoles = ['SUPER_ADMIN', 'CONTENT_MANAGER', 'SUPPORT', 'DEALER_MANAGER'];
    const assignedRole = validRoles.includes(role) ? role : 'CONTENT_MANAGER';

    const newAdmin = await prisma.adminUser.create({
      data: {
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password: hashPassword(password),
        role: assignedRole,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json({ success: true, message: 'Yeni yönetici hesabı başarıyla oluşturuldu.', user: newAdmin });
  } catch (error) {
    console.error('Admin Users POST Error:', error);
    return NextResponse.json({ error: 'Yönetici oluşturulurken sunucu hatası oluştu.' }, { status: 500 });
  }
}

// PUT: Update Admin Account Role / Status (SUPER_ADMIN only)
export async function PUT(request) {
  try {
    const authSession = await verifyAuth(request, 'admin', 'SUPER_ADMIN');
    if (!authSession) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { id, role, status, password } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Yönetici ID bilgisi gerekli.' }, { status: 400 });
    }

    const updateData = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (password && password.trim() !== '') {
      updateData.password = hashPassword(password);
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        status: true
      }
    });

    return NextResponse.json({ success: true, message: 'Yönetici bilgileri güncellendi.', user: updatedUser });
  } catch (error) {
    console.error('Admin Users PUT Error:', error);
    return NextResponse.json({ error: 'Güncelleme hatası oluştu.' }, { status: 500 });
  }
}
