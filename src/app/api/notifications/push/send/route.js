import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/pushServer';
import { verifyAuth } from '@/lib/auth-check';

export async function POST(req) {
  try {
    const auth = await verifyAuth(req, 'admin');
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Yalnızca yöneticiler bildirim gönderebilir.' }, { status: 401 });
    }

    const body = await req.json();
    const { userType, userId, title, body: textBody, url } = body;

    if (!title || !textBody) {
      return NextResponse.json(
        { error: 'Bildirim başlığı (title) ve içeriği (body) zorunludur.' },
        { status: 400 }
      );
    }

    const result = await sendPushNotification({
      userType,
      userId,
      title,
      body: textBody,
      url: url || '/'
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Push send API error:', error);
    return NextResponse.json(
      { error: 'Bildirim gönderilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
