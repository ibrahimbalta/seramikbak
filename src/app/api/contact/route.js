import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Ad Soyad, E-Posta ve Mesaj alanları zorunludur.' },
        { status: 400 }
      );
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || '',
        subject: subject || 'Genel Destek / Soru',
        message,
        status: 'UNREAD'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla iletildi. Ekibimiz en kısa sürede sizinle iletişime geçecektir.',
      data: newMessage
    });
  } catch (error) {
    console.error('Contact API POST Error:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
