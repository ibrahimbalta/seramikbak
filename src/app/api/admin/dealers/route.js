import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const dealers = await prisma.dealer.findMany({
      include: {
        brand: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(dealers);
  } catch (error) {
    console.error('Admin Dealers GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dealers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, brandId, phone, address, city, district, lat, lng } = body;

    if (!name || !brandId || !phone || !address || !city || !district) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const latitude = parseFloat(lat) || 40.9901;
    const longitude = parseFloat(lng) || 29.0278;

    const newDealer = await prisma.dealer.create({
      data: {
        name,
        brandId,
        phone,
        address,
        city,
        district,
        lat: latitude,
        lng: longitude
      },
      include: {
        brand: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, dealer: newDealer });
  } catch (error) {
    console.error('Admin Dealers POST Error:', error);
    return NextResponse.json({ error: 'Failed to create dealer', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing dealer id parameter' }, { status: 400 });
    }

    await prisma.dealer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Dealers DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete dealer', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing dealer id or status' }, { status: 400 });
    }

    const updatedDealer = await prisma.dealer.update({
      where: { id },
      data: { status },
      include: {
        brand: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, dealer: updatedDealer });
  } catch (error) {
    console.error('Admin Dealers PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update dealer', details: error.message }, { status: 500 });
  }
}

