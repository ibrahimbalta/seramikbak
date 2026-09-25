import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  classifyCeramicColor,
  searchProductsByVisualColor
} from '@/lib/visualColorSearch';

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

    const { searchParams } = new URL(request.url);

    // 1. Parse client-extracted color metrics
    let detectedColor = formData.get('detectedColor') || searchParams.get('fallbackColor') || '';
    let colorFamilies = [];
    let rgb = null;
    let style = formData.get('style') || null;

    try {
      const colorFamiliesStr = formData.get('colorFamilies');
      if (colorFamiliesStr) {
        colorFamilies = JSON.parse(colorFamiliesStr);
      }
    } catch {
      // ignore JSON parse error
    }

    try {
      const rgbStr = formData.get('rgb');
      if (rgbStr) {
        rgb = JSON.parse(rgbStr);
      }
    } catch {
      // ignore JSON parse error
    }

    // If RGB was provided but detectedColor wasn't, or to calibrate:
    if (rgb && (Array.isArray(rgb) || (typeof rgb === 'object' && rgb.r !== undefined))) {
      const r = Array.isArray(rgb) ? rgb[0] : rgb.r;
      const g = Array.isArray(rgb) ? rgb[1] : rgb.g;
      const b = Array.isArray(rgb) ? rgb[2] : rgb.b;
      
      const classified = classifyCeramicColor(r, g, b);
      if (!detectedColor) {
        detectedColor = classified.primaryColor;
      }
      if (colorFamilies.length === 0) {
        colorFamilies = classified.compatibleColors;
      }
    }

    if (!detectedColor) {
      detectedColor = 'Gri';
    }

    // 2. Perform intelligent visual color search on the database
    const searchResult = await searchProductsByVisualColor(prisma, {
      detectedColor,
      colorFamilies,
      rgb: Array.isArray(rgb) ? rgb : (rgb ? [rgb.r, rgb.g, rgb.b] : null),
      style,
      limit: 40
    });

    // 3. Log search action in analytics
    try {
      await prisma.analyticsLog.create({
        data: {
          action: 'SEARCH',
          query: `Görsel Arama (${detectedColor} - ${file.name || 'Görsel'})`,
          city: 'İstanbul'
        }
      });
    } catch (logErr) {
      console.warn('[Visual Search] Analytics log warning:', logErr.message);
    }

    return NextResponse.json({
      success: true,
      products: searchResult.products,
      detectedColor: searchResult.detectedColor,
      compatibleColors: searchResult.compatibleColors,
      totalCount: searchResult.totalCount
    });

  } catch (error) {
    console.error('[Visual Search Route Error]:', error);
    return NextResponse.json(
      { error: 'Görsel arama işlemi sırasında hata oluştu.', details: error.message },
      { status: 500 }
    );
  }
}
