import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'Görsel dosyası bulunamadı.' },
        { status: 400 }
      );
    }

    // Prepare FormData to send to the Python AI service
    const forwardFormData = new FormData();
    forwardFormData.append('file', file);

    let searchResults = [];
    try {
      // Fetch from the local Python AI service
      const aiResponse = await fetch('http://127.0.0.1:8000/search-visual', {
        method: 'POST',
        body: forwardFormData,
      });

      if (aiResponse.ok) {
        searchResults = await aiResponse.json();
      } else {
        const errorDetail = await aiResponse.text();
        console.error('Python AI Service Error:', errorDetail);
        throw new Error('AI service returned error status');
      }
    } catch (aiError) {
      console.warn('Python AI Service is offline or unreachable. Using database fallback logic.', aiError);
      
      const { searchParams } = new URL(request.url);
      const fallbackColor = searchParams.get('fallbackColor') || 'Gri';

      // Query database for products matching the detected dominant color category
      const fallbackProducts = await prisma.product.findMany({
        where: {
          OR: [
            { color: { contains: fallbackColor } },
            { name: { contains: fallbackColor } }
          ]
        },
        take: 5,
        include: {
          brand: {
            select: { id: true, name: true, logoUrl: true }
          }
        }
      });
      
      let finalFallback = fallbackProducts;
      
      // If we don't have enough matching color products, append other random products
      if (finalFallback.length < 5) {
        const extraProducts = await prisma.product.findMany({
          where: {
            id: { notIn: fallbackProducts.map(p => p.id) }
          },
          take: 5 - fallbackProducts.length,
          include: {
            brand: {
              select: { id: true, name: true, logoUrl: true }
            }
          }
        });
        finalFallback = [...fallbackProducts, ...extraProducts];
      }
      
      const mockedResults = finalFallback.map((p, idx) => ({
        ...p,
        similarityScore: 90 - (idx * 5) - Math.floor(Math.random() * 5),
        isFallback: true
      }));

      return NextResponse.json({
        products: mockedResults,
        warning: 'AI Servisi çevrimdışı, yedek arama sonuçları gösteriliyor.'
      });
    }

    if (searchResults.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const productIds = searchResults.map(res => res.productId);

    // Fetch matching products from SQLite
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
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
    });

    // Map similarity scores back to products and sort by score descending
    const productsWithScores = products.map(product => {
      const match = searchResults.find(res => res.productId === product.id);
      return {
        ...product,
        similarityScore: match ? match.score : 0,
        isFallback: false
      };
    }).sort((a, b) => b.similarityScore - a.similarityScore);

    // Log the search in analytics
    await prisma.analyticsLog.create({
      data: {
        action: 'SEARCH',
        query: `Görsel Arama (${file.name || 'Resim'})`,
        city: 'İstanbul'
      }
    });

    return NextResponse.json({ products: productsWithScores });
  } catch (error) {
    console.error('Visual Search Route Error:', error);
    return NextResponse.json(
      { error: 'Görsel arama işlemi sırasında hata oluştu.', details: error.message },
      { status: 500 }
    );
  }
}
