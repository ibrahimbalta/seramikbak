import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/sample-orders - Fetch all sample orders with relations
export async function GET() {
  try {
    const orders = await prisma.sampleOrder.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            finish: true,
            width: true,
            height: true,
            brand: { select: { name: true } }
          }
        },
        dealer: {
          select: { id: true, name: true, phone: true, city: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Admin Sample Orders GET Error:', error);
    return NextResponse.json({ error: 'Numune siparişleri yüklenemedi.' }, { status: 500 });
  }
}

// PATCH /api/admin/sample-orders - Update status and shipping details
export async function PATCH(req) {
  try {
    const { id, status, cargoCompany, trackingNumber } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Sipariş ID gerekli.' }, { status: 400 });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (cargoCompany !== undefined) updateData.cargoCompany = cargoCompany;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    const updated = await prisma.sampleOrder.update({
      where: { id },
      data: updateData,
      include: {
        product: { select: { name: true } },
        dealer: { select: { name: true } }
      }
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Admin Sample Orders PATCH Error:', error);
    return NextResponse.json({ error: 'Numune siparişi güncellenemedi.' }, { status: 500 });
  }
}

// DELETE /api/admin/sample-orders?id=... - Delete sample order
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Sipariş ID gerekli.' }, { status: 400 });
    }

    await prisma.sampleOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Sample Orders DELETE Error:', error);
    return NextResponse.json({ error: 'Numune siparişi silinemedi.' }, { status: 500 });
  }
}
