import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { subscription, userType = 'ALL', userId = null } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { error: 'Geçersiz push abonelik verisi.' },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;

    // Upsert subscription
    const pushSub = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userType: userType || 'ALL',
        userId: userId || null
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userType: userType || 'ALL',
        userId: userId || null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Anlık bildirim aboneliği başarıyla kaydedildi!',
      id: pushSub.id
    });
  } catch (error) {
    console.error('Push subscribe API error:', error);
    return NextResponse.json(
      { error: 'Abonelik kaydedilirken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
