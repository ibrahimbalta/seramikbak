import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        password: true,
        logoUrl: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Admin Brands API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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

    const updated = await prisma.brand.update({
      where: { id },
      data: {
        username,
        password
      }
    });

    return NextResponse.json({ success: true, brand: updated });
  } catch (error) {
    console.error('Admin Brands Update Error:', error);
    return NextResponse.json({ error: 'Sistem hatası.' }, { status: 500 });
  }
}
