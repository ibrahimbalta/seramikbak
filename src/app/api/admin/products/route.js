import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

import { uploadImage } from '@/lib/cloudinary';

// Helper to save base64 image (tries Cloudinary first, falls back to local storage)
async function saveBase64Image(base64Data, filename) {
  try {
    // If Cloudinary credentials are set, upload directly to Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      console.log('[Products API] Uploading image to Cloudinary:', filename);
      const publicId = path.basename(filename, path.extname(filename));
      const uploadResult = await uploadImage(base64Data, {
        public_id: publicId,
        folder: 'seramikbak/products'
      });
      return uploadResult.secure_url;
    }
  } catch (cloudinaryErr) {
    console.error('[Products API] Cloudinary upload failed, falling back to local storage:', cloudinaryErr);
  }

  // Fallback to local storage (existing code)
  try {
    const publicDir = path.join(process.cwd(), 'public', 'textures');
    
    // Ensure directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const cleanBase64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    const filePath = path.join(publicDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/textures/${filename}`;
  } catch (err) {
    console.error('[Products API] Failed to save image locally:', err);
    return null;
  }
}

// GET: List products with search, pagination, and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const brandId = searchParams.get('brandId') || '';
    const style = searchParams.get('style') || '';
    const finish = searchParams.get('finish') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    const skip = (page - 1) * limit;

    // Build query conditions
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } }
      ];
    }
    
    if (brandId) {
      where.brandId = brandId;
    }
    
    if (style) {
      where.style = style;
    }
    
    if (finish) {
      where.finish = finish;
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: {
            select: { name: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      products,
      total,
      page,
      totalPages
    });

  } catch (error) {
    console.error('[Products GET API Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a product manually
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      code,
      brandId,
      width,
      height,
      color,
      finish,
      style,
      area,
      imageBase64,
      imageExt = 'jpg',
      textureBase64,
      textureExt = 'jpg',
      isPremium = false,
      trendyolPrice,
      trendyolUrl,
      hepsiburadaPrice,
      hepsiburadaUrl,
      n11Price,
      n11Url,
      koctasPrice,
      koctasUrl,
      bauhausPrice,
      bauhausUrl
    } = body;

    // Validation
    if (!name || !code || !brandId || !width || !height) {
      return NextResponse.json({ success: false, error: 'Eksik ürün bilgileri. İsim, SKU, Marka ve Ebat zorunludur.' }, { status: 400 });
    }

    // Check unique SKU code
    const existing = await prisma.product.findUnique({
      where: { code: code.trim().toUpperCase() }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: `Bu ürün kodu (SKU: ${code}) zaten kullanımda.` }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    let imageUrl = '/textures/calacatta_gold.jpg';
    let textureUrl = '/textures/calacatta_gold.jpg';

    // Set default base texture if style matches
    const defaultImage = style === 'Ahşap' ? '/textures/teak_ahsap.jpg' :
                         style === 'Beton' ? '/textures/loft_beton.jpg' :
                         style === 'Taş' ? '/textures/vista_bej.jpg' : '/textures/calacatta_gold.jpg';
    imageUrl = defaultImage;
    textureUrl = defaultImage;

    // Write custom files if base64 provided
    if (imageBase64) {
      const imgName = `${cleanCode.toLowerCase()}_thumb.${imageExt}`;
      const savedPath = await saveBase64Image(imageBase64, imgName);
      if (savedPath) imageUrl = savedPath;
    }

    if (textureBase64) {
      const texName = `${cleanCode.toLowerCase()}_texture.${textureExt}`;
      const savedPath = await saveBase64Image(textureBase64, texName);
      if (savedPath) textureUrl = savedPath;
    }

    // Save product
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        code: cleanCode,
        brandId,
        width: parseInt(width, 10),
        height: parseInt(height, 10),
        color: color || 'Gri',
        finish: finish || 'Mat',
        style: style || 'Mermer',
        area: area || 'Yer,Duvar',
        imageUrl,
        textureUrl,
        isPremium: Boolean(isPremium),
        trendyolPrice: trendyolPrice ? parseFloat(trendyolPrice) : null,
        trendyolUrl: trendyolUrl || null,
        hepsiburadaPrice: hepsiburadaPrice ? parseFloat(hepsiburadaPrice) : null,
        hepsiburadaUrl: hepsiburadaUrl || null,
        n11Price: n11Price ? parseFloat(n11Price) : null,
        n11Url: n11Url || null,
        koctasPrice: koctasPrice ? parseFloat(koctasPrice) : null,
        koctasUrl: koctasUrl || null,
        bauhausPrice: bauhausPrice ? parseFloat(bauhausPrice) : null,
        bauhausUrl: bauhausUrl || null
      }
    });

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('[Products POST API Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update a product manually
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      code,
      brandId,
      width,
      height,
      color,
      finish,
      style,
      area,
      imageBase64,
      imageExt = 'jpg',
      textureBase64,
      textureExt = 'jpg',
      isPremium,
      trendyolPrice,
      trendyolUrl,
      hepsiburadaPrice,
      hepsiburadaUrl,
      n11Price,
      n11Url,
      koctasPrice,
      koctasUrl,
      bauhausPrice,
      bauhausUrl
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Ürün ID parametresi gereklidir.' }, { status: 400 });
    }

    // Verify product exists
    const current = await prisma.product.findUnique({
      where: { id }
    });

    if (!current) {
      return NextResponse.json({ success: false, error: 'Güncellenecek ürün bulunamadı.' }, { status: 404 });
    }

    const cleanCode = code ? code.trim().toUpperCase() : current.code;

    // Check SKU code uniqueness if changed
    if (code && cleanCode !== current.code) {
      const existing = await prisma.product.findUnique({
        where: { code: cleanCode }
      });
      if (existing) {
        return NextResponse.json({ success: false, error: `Bu ürün kodu (SKU: ${cleanCode}) zaten kullanımda.` }, { status: 400 });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (code) updateData.code = cleanCode;
    if (brandId) updateData.brandId = brandId;
    if (width !== undefined) updateData.width = parseInt(width, 10);
    if (height !== undefined) updateData.height = parseInt(height, 10);
    if (color) updateData.color = color;
    if (finish) updateData.finish = finish;
    if (style) updateData.style = style;
    if (area) updateData.area = area;
    if (isPremium !== undefined) updateData.isPremium = Boolean(isPremium);

    updateData.trendyolPrice = trendyolPrice !== undefined ? (trendyolPrice ? parseFloat(trendyolPrice) : null) : undefined;
    updateData.trendyolUrl = trendyolUrl !== undefined ? (trendyolUrl || null) : undefined;
    updateData.hepsiburadaPrice = hepsiburadaPrice !== undefined ? (hepsiburadaPrice ? parseFloat(hepsiburadaPrice) : null) : undefined;
    updateData.hepsiburadaUrl = hepsiburadaUrl !== undefined ? (hepsiburadaUrl || null) : undefined;
    updateData.n11Price = n11Price !== undefined ? (n11Price ? parseFloat(n11Price) : null) : undefined;
    updateData.n11Url = n11Url !== undefined ? (n11Url || null) : undefined;
    updateData.koctasPrice = koctasPrice !== undefined ? (koctasPrice ? parseFloat(koctasPrice) : null) : undefined;
    updateData.koctasUrl = koctasUrl !== undefined ? (koctasUrl || null) : undefined;
    updateData.bauhausPrice = bauhausPrice !== undefined ? (bauhausPrice ? parseFloat(bauhausPrice) : null) : undefined;
    updateData.bauhausUrl = bauhausUrl !== undefined ? (bauhausUrl || null) : undefined;

    // Save custom images if base64 provided
    if (imageBase64) {
      const imgName = `${cleanCode.toLowerCase()}_thumb.${imageExt}`;
      const savedPath = await saveBase64Image(imageBase64, imgName);
      if (savedPath) updateData.imageUrl = savedPath;
    }

    if (textureBase64) {
      const texName = `${cleanCode.toLowerCase()}_texture.${textureExt}`;
      const savedPath = await saveBase64Image(textureBase64, texName);
      if (savedPath) updateData.textureUrl = savedPath;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct
    });

  } catch (error) {
    console.error('[Products PUT API Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove product by ID
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Silinecek ürün ID parametresi gereklidir.' }, { status: 400 });
    }

    // Delete product from database
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Ürün veritabanından başarıyla silindi.'
    });

  } catch (error) {
    console.error('[Products DELETE API Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
