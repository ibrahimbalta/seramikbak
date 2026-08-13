import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/contact-messages - Fetch all submitted contact messages
export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Admin Contact Messages GET Error:', error);
    return NextResponse.json({ error: 'Mesajlar yüklenemedi.' }, { status: 500 });
  }
}

// PATCH /api/admin/contact-messages - Update status (UNREAD, READ, REPLIED)
export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'ID ve Statü zorunludur.' }, { status: 400 });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin Contact Messages PATCH Error:', error);
    return NextResponse.json({ error: 'Statü güncellenemedi.' }, { status: 500 });
  }
}

// DELETE /api/admin/contact-messages?id=... - Delete message
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parametresi gerekli.' }, { status: 400 });
    }

    await prisma.contactMessage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Contact Messages DELETE Error:', error);
    return NextResponse.json({ error: 'Mesaj silinemedi.' }, { status: 500 });
  }
}
