import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { verifyAuth } from '@/lib/auth-check';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const session = await verifyAuth(request);
    if (!session || (session.role !== 'dealer' && session.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim. Lütfen giriş yapınız.' }, { status: 401 });
    }

    const body = await request.json();
    const { base64Data, filename, folder = 'seramikbak/showroom' } = body;

    if (!base64Data || !filename) {
      return NextResponse.json({ success: false, error: 'Eksik parametreler: base64Data ve filename zorunludur.' }, { status: 400 });
    }

    // 1. Extension Validation (Safe images only - No SVG, HTML, or executables)
    const fileExt = path.extname(filename).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json({ success: false, error: 'Yalnızca JPEG, PNG ve WebP görsel formatlarına izin verilir.' }, { status: 400 });
    }

    // 2. Base64 Size Limit (Max 10MB binary ~14MB base64 string)
    if (base64Data.length > 14 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Görsel boyutu izin verilen sınırı (10MB) aşmaktadır.' }, { status: 413 });
    }

    // 3. Filename Sanitization (Prevent Path Traversal)
    const sanitizedBase = path.basename(filename, fileExt).replace(/[^a-zA-Z0-9_\-]/g, '_');
    const safeFilename = `${sanitizedBase}${fileExt}`;

    let fileUrl = null;
    let cloudinaryError = null;

    // 1. Try Cloudinary first
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const publicId = `${sanitizedBase}_${Date.now()}`;
        const uploadResult = await uploadImage(base64Data, {
          public_id: publicId,
          folder: folder
        });
        fileUrl = uploadResult.secure_url;
      }
    } catch (cloudinaryErr) {
      console.error('[Upload API] Cloudinary upload failed:', cloudinaryErr);
      cloudinaryError = cloudinaryErr.message || String(cloudinaryErr);
    }

    // 2. Fallback to Local Storage
    if (!fileUrl) {
      try {
        const publicDir = path.join(process.cwd(), 'public', 'uploads', 'showroom');
        
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }

        const cleanBase64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
        const buffer = Buffer.from(cleanBase64, 'base64');
        
        const uniqueFilename = `${sanitizedBase}_${Date.now()}${fileExt}`;
        const filePath = path.join(publicDir, uniqueFilename);
        
        fs.writeFileSync(filePath, buffer);
        fileUrl = `/uploads/showroom/${uniqueFilename}`;
      } catch (err) {
        console.error('[Upload API] Failed to save image locally:', err);
        const isVercel = process.env.VERCEL || process.env.NOW_BUILDER || process.cwd().includes('vercel');
        let errorMsg = 'Dosya sunucuya kaydedilemedi.';
        
        if (isVercel) {
          errorMsg = 'Vercel salt-okunur (read-only) dosya sistemine sahip olduğu için yerel yükleme başarısız oldu. Lütfen Vercel panelinde Cloudinary API anahtarlarını (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) Çevre Değişkenleri (Environment Variables) olarak ekleyin.';
          if (cloudinaryError) {
            errorMsg += ` (Cloudinary Hatası: ${cloudinaryError})`;
          }
        } else {
          if (cloudinaryError) {
            errorMsg += ` (Cloudinary Hatası: ${cloudinaryError})`;
          }
        }
        
        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('[Upload API Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
