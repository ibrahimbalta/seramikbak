import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';

export async function GET(request) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapınız.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const userId = session.role === 'admin' && requestedUserId ? requestedUserId : session.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID bilgisi gereklidir.' },
        { status: 400 }
      );
    }

    // Find all favorites for this user
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                logoUrl: true
              }
            },
            campaigns: {
              where: {
                status: 'ACTIVE',
                budget: { gt: 0 }
              },
              select: {
                id: true,
                bidAmount: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('List Favorites API Error:', error);
    return NextResponse.json(
      { error: 'Favoriler listelenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
