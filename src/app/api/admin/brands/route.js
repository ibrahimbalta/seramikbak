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
        logoUrl: true
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
    const { id, username, password } = body;

    if (!id || !username || !password) {
      return NextResponse.json({ error: 'Eksik bilgi gönderildi.' }, { status: 400 });
    }

    // Check if username is taken by another brand
    const existing = await prisma.brand.findFirst({
      where: {
        username,
        NOT: { id }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Bu kullanıcı adı başka bir marka tarafından kullanılıyor.' }, { status: 400 });
    }

    const finalPassword = password.includes(':') ? password : hashPassword(password);
    const updated = await prisma.brand.update({
      where: { id },
      data: {
        username,
        password: finalPassword
      }
    });

    return NextResponse.json({ success: true, brand: { id: updated.id, name: updated.name } });
  } catch (error) {
    console.error('Admin Brands Update Error:', error);
    return NextResponse.json({ error: 'Sistem hatası.' }, { status: 500 });
  }
}
