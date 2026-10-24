import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { verifyAuth } from '@/lib/auth-check';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const session = await verifyAuth(request);
    if (!session || (session.role !== 'brand' && session.role !== 'admin' && session.role !== 'dealer')) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim. Lütfen giriş yapınız.' }, { status: 401 });
    }

    const body = await request.json();
    const { base64Data, filename, folder = 'seramikbak/catalogs' } = body;

    if (!base64Data || !filename) {
      return NextResponse.json({ success: false, error: 'Eksik parametreler: base64Data ve filename zorunludur.' }, { status: 400 });
    }

    // 1. Extension Validation (Safe images only)
    const fileExt = path.extname(filename).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json({ success: false, error: 'Yalnızca JPEG, PNG, WebP ve SVG görsel formatlarına izin verilir.' }, { status: 400 });
    }

    // 2. Base64 Size Limit (Max 12MB binary ~16MB base64 string)
    if (base64Data.length > 16 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Görsel boyutu izin verilen sınırı (12MB) aşmaktadır.' }, { status: 413 });
    }

    // 3. Filename Sanitization (Prevent Path Traversal)
    const sanitizedBase = path.basename(filename, fileExt).replace(/[^a-zA-Z0-9_\-]/g, '_');

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
      console.error('[Brand Upload API] Cloudinary upload failed:', cloudinaryErr);
      cloudinaryError = cloudinaryErr.message || String(cloudinaryErr);
    }

    // 2. Fallback to Local Storage
    if (!fileUrl) {
      try {
        const publicDir = path.join(process.cwd(), 'public', 'uploads', 'catalogs');
        
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }

        const cleanBase64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
        const buffer = Buffer.from(cleanBase64, 'base64');
        
        const uniqueFilename = `${sanitizedBase}_${Date.now()}${fileExt}`;
        const filePath = path.join(publicDir, uniqueFilename);
        
        fs.writeFileSync(filePath, buffer);
        fileUrl = `/uploads/catalogs/${uniqueFilename}`;
      } catch (err) {
        console.error('[Brand Upload API] Failed to save image locally:', err);
        const isVercel = process.env.VERCEL || process.env.NOW_BUILDER || process.cwd().includes('vercel');
        let errorMsg = 'Dosya sunucuya kaydedilemedi.';
        
        if (isVercel) {
          // If running in a read-only environment without Cloudinary, return the data URL so the client still works!
          return NextResponse.json({ 
            success: true, 
            url: base64Data,
            note: 'Sunucu salt-okunur modda olduğu için veri doğrudan yerel olarak işlendi.' 
          });
        }
        
        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('[Brand Upload API Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
