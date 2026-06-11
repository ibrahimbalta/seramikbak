import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { uploadImage } from '@/lib/cloudinary';

const execAsync = promisify(exec);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'Lütfen bir ZIP dosyası yükleyin.' }, { status: 400 });
    }

    const logs = [];
    logs.push(`[Medya Yükleme] ZIP dosyası alındı: "${file.name}" (${file.size} bytes). Kaydediliyor...`);

    const texturesDir = path.join(process.cwd(), 'public', 'textures');
    
    // Ensure public/textures directory exists
    await fs.mkdir(texturesDir, { recursive: true });

    // Save uploaded ZIP file
    const zipPath = path.join(texturesDir, 'uploaded_textures.zip');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(zipPath, buffer);
    logs.push(`[Medya Yükleme] ZIP dosyası geçici klasöre yazıldı. Çıkartılıyor...`);

    // Extract ZIP file using Windows native PowerShell Expand-Archive
    // Expand-Archive -Path "..." -DestinationPath "..." -Force
    // This has 0 external npm dependencies!
    const command = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${texturesDir}' -Force"`;
    
    try {
      await execAsync(command);
      logs.push(`[Medya Yükleme] ZIP dosyası başarıyla çıkartıldı (PowerShell Expand-Archive).`);
    } catch (cmdErr) {
      console.error('Extraction command error:', cmdErr);
      logs.push(`[Medya Yükleme - Hata] Çıkartma işlemi başarısız: ${cmdErr.message}`);
      return NextResponse.json({ success: false, error: 'ZIP dosyası çıkartılamadı.', details: cmdErr.message }, { status: 500 });
    }

    // Read the extracted files in public/textures/
    const files = await fs.readdir(texturesDir);
    let matchedCount = 0;
    
    logs.push(`[Eşleştirme] public/textures/ klasörü taranıyor, veritabanı ile eşleştiriliyor...`);

    for (const fileName of files) {
      // Skip folders or the zip file itself
      if (fileName.endsWith('.zip')) continue;
      
      const fileExt = path.extname(fileName).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt)) continue;

      // The file name without extension should match the SKU code (e.g. BIEN-BOR-ANT.jpg -> SKU: BIEN-BOR-ANT)
      const skuCode = path.basename(fileName, fileExt).toUpperCase();

      // Check if this SKU exists in DB
      const product = await prisma.product.findUnique({
        where: { code: skuCode }
      });

      if (product) {
        let imageUrl = `/textures/${fileName}`;
        let textureUrl = `/textures/${fileName}`;
        const filePath = path.join(texturesDir, fileName);

        // Upload to Cloudinary if config is present
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          try {
            logs.push(`[Cloudinary] "${fileName}" buluta yükleniyor...`);
            const uploadResult = await uploadImage(filePath, {
              public_id: skuCode.toLowerCase(),
              folder: 'seramikbak/products'
            });
            imageUrl = uploadResult.secure_url;
            textureUrl = uploadResult.secure_url;
            logs.push(`[Cloudinary] Yükleme başarılı: ${imageUrl}`);
          } catch (cloudErr) {
            logs.push(`[Cloudinary - Hata] Yükleme başarısız (${cloudErr.message}), lokale dönülüyor.`);
          }
        }

        // Update product image and texture URLs
        await prisma.product.update({
          where: { code: skuCode },
          data: {
            imageUrl,
            textureUrl
          }
        });
        logs.push(`[Eşleşti] "${product.name}" ürünü için görsel atandı: SKU: ${skuCode}`);
        matchedCount++;
      }
    }

    // Cleanup: delete the zip file
    try {
      await fs.unlink(zipPath);
      logs.push(`[Medya Temizliği] Geçici ZIP dosyası silindi.`);
    } catch (cleanupErr) {
      console.warn('Zip file cleanup failed:', cleanupErr);
    }

    logs.push(`[Tamamlandı] Eşleştirme bitti. ${matchedCount} adet ürün görseli başarıyla güncellendi.`);

    return NextResponse.json({
      success: true,
      matchedCount,
      logs
    });

  } catch (error) {
    console.error('Import ZIP API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
