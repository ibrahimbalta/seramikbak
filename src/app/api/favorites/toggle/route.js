import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';

export async function POST(request) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapınız.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId: requestedUserId, productId } = body;
    const userId = session.role === 'admin' && requestedUserId ? requestedUserId : session.id;

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'Kullanıcı ve ürün ID bilgisi gereklidir.' },
        { status: 400 }
      );
    }

    // Check if it already exists
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingFavorite) {
      // Delete (Remove from favorites)
      await prisma.favorite.delete({
        where: {
          userId_productId: {
            userId,
            productId
          }
        }
      });

      return NextResponse.json({
        success: true,
        isFavorited: false,
        message: 'Ürün favorilerden kaldırıldı.'
      });
    } else {
      // Create (Add to favorites)
      await prisma.favorite.create({
        data: {
          userId,
          productId
        }
      });

      // Log a CLICK/FAVORITE interaction in analytics
      await prisma.analyticsLog.create({
        data: {
          action: 'CLICK',
          productId,
          city: 'İstanbul'
        }
      });

      return NextResponse.json({
        success: true,
        isFavorited: true,
        message: 'Ürün favorilere eklendi.'
      });
    }
  } catch (error) {
    console.error('Toggle Favorite API Error:', error);
    return NextResponse.json(
      { error: 'Favori işlemi başarısız oldu.' },
      { status: 500 }
    );
  }
}
