import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request, 'admin');
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const architects = await prisma.architect.findMany({
      where,
      include: {
        projects: {
          select: { id: true, title: true }
        },
        samples: {
          select: { id: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const counts = {
      total: await prisma.architect.count(),
      pending: await prisma.architect.count({ where: { status: 'PENDING_APPROVAL' } }),
      approved: await prisma.architect.count({ where: { status: 'APPROVED' } }),
      rejected: await prisma.architect.count({ where: { status: 'REJECTED' } })
    };

    return NextResponse.json({ success: true, architects, counts });
  } catch (error) {
    console.error('Admin Architects GET Error:', error);
    return NextResponse.json({ error: 'Mimarlar listelenemedi', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await verifyAuth(request, 'admin');
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Mimar ID ve durum bilgisi gereklidir.' }, { status: 400 });
    }

    if (!['PENDING_APPROVAL', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Geçersiz durum değeri.' }, { status: 400 });
    }

    const updated = await prisma.architect.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, architect: updated });
  } catch (error) {
    console.error('Admin Architects PUT Error:', error);
    return NextResponse.json({ error: 'Durum güncellenemedi', details: error.message }, { status: 500 });
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
      return NextResponse.json({ error: 'Mimar ID parametresi eksik.' }, { status: 400 });
    }

    await prisma.architect.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Architects DELETE Error:', error);
    return NextResponse.json({ error: 'Mimar silinemedi', details: error.message }, { status: 500 });
  }
}
