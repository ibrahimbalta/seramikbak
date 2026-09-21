import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendContactNotification } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req) {
  try {
    const rateLimit = checkRateLimit(req, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla mesaj gönderdiniz. Lütfen bir dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Ad Soyad, E-Posta ve Mesaj alanları zorunludur.' },
        { status: 400 }
      );
    }

    if (name.length > 150 || email.length > 150 || (subject && subject.length > 200) || message.length > 5000) {
      return NextResponse.json(
        { error: 'Girdi karakter sınırını aşıyor.' },
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

    // Send async email notification to seramikbak@gmail.com
    sendContactNotification({ name, email, phone, subject: subject || 'Genel Destek / Soru', message }).catch(err => {
      console.error('Contact email notification trigger error:', err);
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
