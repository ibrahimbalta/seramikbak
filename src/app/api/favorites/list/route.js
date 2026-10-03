import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');

    // Anti-IDOR: Regular users can only access their own favorites
    const targetUserId = (auth.role === 'admin' && queryUserId) ? queryUserId : auth.id;
    if (queryUserId && auth.role !== 'admin' && auth.id !== queryUserId) {
      return NextResponse.json(
        { error: 'Bu veriye erişim yetkiniz bulunmuyor.' },
        { status: 403 }
      );
    }

    // Find all favorites for this user
    const favorites = await prisma.favorite.findMany({
      where: { userId: targetUserId },
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
      { error: 'Favoriler listelenirken hata oluştu.', details: error.message },
      { status: 500 }
    );
  }
}
