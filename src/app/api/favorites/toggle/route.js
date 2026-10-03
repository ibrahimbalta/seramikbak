import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Ürün ID bilgisi gereklidir.' },
        { status: 400 }
      );
    }

    // Anti-IDOR: Regular users can only modify their own favorites
    const targetUserId = (auth.role === 'admin' && userId) ? userId : auth.id;
    if (userId && auth.role !== 'admin' && auth.id !== userId) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor.' },
        { status: 403 }
      );
    }

    // Check if it already exists
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: targetUserId,
          productId
        }
      }
    });

    if (existingFavorite) {
      // Delete (Remove from favorites)
      await prisma.favorite.delete({
        where: {
          userId_productId: {
            userId: targetUserId,
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
          userId: targetUserId,
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
      { error: 'Favori işlemi başarısız oldu.', details: error.message },
      { status: 500 }
    );
  }
}
