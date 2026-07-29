import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch all installers for Admin
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'ALL'; // ALL, PENDING, VERIFIED
    const search = searchParams.get('search') || '';

    const where = {};

    if (filter === 'PENDING') {
      where.verified = false;
    } else if (filter === 'VERIFIED') {
      where.verified = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } }
      ];
    }

    const installers = await prisma.installer.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    const stats = {
      total: await prisma.installer.count(),
      pending: await prisma.installer.count({ where: { verified: false } }),
      verified: await prisma.installer.count({ where: { verified: true } })
    };

    return NextResponse.json({
      success: true,
      stats,
      count: installers.length,
      installers
    });
  } catch (error) {
    console.error('GET /api/admin/installers Error:', error);
    return NextResponse.json({ success: false, error: 'Usta listesi çekilirken hata oluştu.' }, { status: 500 });
  }
}

// PUT: Update installer (approve, toggle verified, update details)
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      verified,
      name,
      companyName,
      phone,
      city,
      district,
      experienceYears,
      specialties,
      rating,
      reviewCount,
      notes,
      status
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Usta ID zorunludur.' }, { status: 400 });
    }

    const updated = await prisma.installer.update({
      where: { id },
      data: {
        verified: verified !== undefined ? Boolean(verified) : undefined,
        name: name !== undefined ? name.trim() : undefined,
        companyName: companyName !== undefined ? (companyName ? companyName.trim() : null) : undefined,
        phone: phone !== undefined ? phone.trim() : undefined,
        city: city !== undefined ? city.trim() : undefined,
        district: district !== undefined ? (district ? district.trim() : null) : undefined,
        experienceYears: experienceYears !== undefined ? parseInt(experienceYears, 10) : undefined,
        specialties: specialties !== undefined ? specialties.trim() : undefined,
        rating: rating !== undefined ? parseFloat(rating) : undefined,
        reviewCount: reviewCount !== undefined ? parseInt(reviewCount, 10) : undefined,
        notes: notes !== undefined ? (notes ? notes.trim() : null) : undefined,
        status: status !== undefined ? status : undefined
      }
    });

    return NextResponse.json({
      success: true,
      installer: updated,
      message: 'Usta bilgileri başarıyla güncellendi.'
    });
  } catch (error) {
    console.error('PUT /api/admin/installers Error:', error);
    return NextResponse.json({ success: false, error: 'Usta güncellenirken hata oluştu.' }, { status: 500 });
  }
}

// DELETE: Remove an installer
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Usta ID zorunludur.' }, { status: 400 });
    }

    await prisma.installer.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Usta kaydı başarıyla silindi.'
    });
  } catch (error) {
    console.error('DELETE /api/admin/installers Error:', error);
    return NextResponse.json({ success: false, error: 'Usta silinirken hata oluştu.' }, { status: 500 });
  }
}
