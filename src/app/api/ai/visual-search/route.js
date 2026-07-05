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
      
      // Try to read client-side computed 4x4 visual signature
      let clientSignature = null;
      try {
        const signatureStr = formData.get('signature');
        if (signatureStr) {
          clientSignature = JSON.parse(signatureStr);
        }
      } catch (err) {
        console.warn('Failed to parse visual signature from client', err);
      }

      // Hardcoded pre-computed 4x4 RGB signatures of our core database textures
      const TEXTURE_SIGNATURES = {
        "Calacatta Gold": [244,244,243,241,241,241,243,243,243,241,241,240,242,242,241,242,242,242,242,242,242,244,244,243,243,243,243,243,243,243,244,244,243,240,240,238,242,242,241,242,242,241,241,240,239,242,242,241],
        "Borneo Antrasit": [34,33,32,31,30,29,24,24,23,53,52,49,26,26,25,20,20,20,31,30,27,48,47,44,23,23,22,27,25,21,35,34,31,35,33,30,31,29,26,34,33,31,22,22,21,28,28,27],
        "Travertino Classico": [212,198,177,209,193,170,200,184,162,205,190,167,203,188,165,216,201,180,213,199,178,200,185,162,211,195,172,209,193,169,208,191,165,211,195,172,202,185,162,213,198,175,205,189,165,200,185,162],
        "Natural Oak": [155,111,67,161,117,74,171,128,85,173,129,85,149,102,59,166,119,73,172,125,79,166,119,75,149,103,59,152,107,65,168,121,75,166,119,73,143,97,54,158,110,65,164,116,69,158,111,66],
        "Concrete Light Grey": [126,125,121,127,126,121,131,130,125,128,127,123,127,126,122,130,129,125,130,129,125,129,128,124,128,127,122,125,124,119,129,129,124,128,127,123,127,126,122,130,128,124,127,126,121,128,127,122],
        "Verona Grey": [126,125,121,127,126,121,131,130,125,128,127,123,127,126,122,130,129,125,130,129,125,129,128,124,128,127,122,125,124,119,129,129,124,128,127,123,127,126,122,130,128,124,127,126,121,128,127,122],
        "Vintage Wood": [155,111,67,161,117,74,171,128,85,173,129,85,149,102,59,166,119,73,172,125,79,166,119,75,149,103,59,152,107,65,168,121,75,166,119,73,143,97,54,158,110,65,164,116,69,158,111,66],
        "Marmara Beyazı": [244,244,243,241,241,241,243,243,243,241,241,240,242,242,241,242,242,242,242,242,242,244,244,243,243,243,243,243,243,243,244,244,243,240,240,238,242,242,241,242,242,241,241,240,239,242,242,241],
        "Royal Grey": [126,125,121,127,126,121,131,130,125,128,127,123,127,126,122,130,129,125,130,129,125,129,128,124,128,127,122,125,124,119,129,129,124,128,127,123,127,126,122,130,128,124,127,126,121,128,127,122],
        "Sand Travertine": [212,198,177,209,193,170,200,184,162,205,190,167,203,188,165,216,201,180,213,199,178,200,185,162,211,195,172,209,193,169,208,191,165,211,195,172,202,185,162,213,198,175,205,189,165,200,185,162],
        "Antik Mermer": [244,244,243,241,241,241,243,243,243,241,241,240,242,242,241,242,242,242,242,242,242,244,244,243,243,243,243,243,243,243,244,244,243,240,240,238,242,242,241,242,242,241,241,240,239,242,242,241]
      };

      const calculateDistance = (sigA, sigB) => {
        let sum = 0;
        for (let i = 0; i < 48; i++) {
          const diff = sigA[i] - sigB[i];
          sum += diff * diff;
        }
        return Math.sqrt(sum);
      };

      // Fetch all products in the database
      const allProducts = await prisma.product.findMany({
        include: {
          brand: {
            select: { id: true, name: true, logoUrl: true }
          }
        }
      });
      
      const scoredFallbackProducts = allProducts.map(p => {
        const signature = TEXTURE_SIGNATURES[p.name];
        let distance = 9999;
        if (signature && clientSignature && clientSignature.length === 48) {
          distance = calculateDistance(clientSignature, signature);
        }
        
        // Map distance to score (0 distance = 100% score)
        const similarityScore = Math.max(1, Math.min(100, Math.round(100 - (distance / 5))));
        
        return {
          ...p,
          similarityScore,
          isFallback: true
        };
      }).sort((a, b) => b.similarityScore - a.similarityScore);

      const finalFallback = scoredFallbackProducts.slice(0, 5);

      return NextResponse.json({
        products: finalFallback,
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
