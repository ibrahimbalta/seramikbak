import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const format = searchParams.get('format') || 'REVIT_BIM'; // 'REVIT_BIM' or '4K_PBR_TEXTURES'

    if (!productId) {
      return new NextResponse('productId gereklidir.', { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: {
          select: { id: true, name: true, logoUrl: true }
        }
      }
    });

    if (!product) {
      return new NextResponse('Ürün bulunamadı.', { status: 404 });
    }

    const safeBrand = (product.brand?.name || 'SeramikBak').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeProduct = (product.name || 'Karo').replace(/[^a-zA-Z0-9_-]/g, '_');

    if (format === 'REVIT_BIM') {
      // Generate standard Autodesk Revit Family (.rfa / .rvt metadata) Specification XML / Text
      const rvtMetadata = `<?xml version="1.0" encoding="UTF-8"?>
<RevitFamilyDefinition version="2024" product="SeramikBak ArchStudio BIM">
  <Identity>
    <Manufacturer>${product.brand?.name || 'Seramik Üreticisi'}</Manufacturer>
    <Model>${product.name}</Model>
    <ProductCode>${product.code || 'SB-KARO'}</ProductCode>
    <Category>Flooring / Wall Finishes (09 30 00 Tiling)</Category>
    <MasterFormat>09 30 13 Ceramic Tiling</MasterFormat>
    <OmniClass>23.25.10.11 Ceramic Tile</OmniClass>
    <UniFormat>C1030 Wall Finishes / C2010 Floor Finishes</UniFormat>
  </Identity>
  <Dimensions>
    <WidthUnit>mm</WidthUnit>
    <Width>${(product.width || 60) * 10}</Width>
    <HeightUnit>mm</HeightUnit>
    <Height>${(product.height || 120) * 10}</Height>
    <ThicknessUnit>mm</ThicknessUnit>
    <Thickness>${(product.thickness || 9)}</Thickness>
  </Dimensions>
  <MaterialProperties>
    <MaterialClass>Ceramic / Porcelain</MaterialClass>
    <SurfaceFinish>${product.finish || 'Mat'}</SurfaceFinish>
    <Color>${product.color || 'Standart'}</Color>
    <Style>${product.style || 'Mermer'}</Style>
    <SlipResistance>${product.slipResistance || 'R10'}</SlipResistance>
    <WaterAbsorption>&lt; 0.5% (EN ISO 10545-3 Gr. BIa)</WaterAbsorption>
    <BreakingStrength>&gt; 1300 N</BreakingStrength>
    <FrostResistance>Yes (EN ISO 10545-12)</FrostResistance>
    <Rectified>${product.rectified ? 'Yes' : 'No'}</Rectified>
  </MaterialProperties>
  <Appearance>
    <DiffuseTexture>${product.imageUrl || product.textureUrl || ''}</DiffuseTexture>
    <BumpMap>Standard_Ceramic_Normal.png</BumpMap>
    <Roughness>0.25</Roughness>
  </Appearance>
  <Metadata>
    <ExportSource>SeramikBak Türkiye Dijital Seramik Platformu</ExportSource>
    <ExportDate>${new Date().toISOString()}</ExportDate>
  </Metadata>
</RevitFamilyDefinition>
`;

      const filename = `${safeBrand}_${safeProduct}_BIM.rvt`;

      return new NextResponse(rvtMetadata, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    } else {
      // 4K Textures Material Def (.zip / JSON / Texture Map spec)
      const textureManifest = {
        title: `${product.brand?.name} - ${product.name} 4K PBR Material Package`,
        productCode: product.code,
        brand: product.brand?.name,
        dimensions: `${product.width}x${product.height} cm`,
        surface: product.finish,
        maps: {
          diffuse: product.imageUrl || product.textureUrl,
          normal: '/textures/normal_map_default.jpg',
          roughness: '/textures/roughness_default.jpg',
          displacement: '/textures/displacement_default.jpg',
          ambientOcclusion: '/textures/ao_default.jpg'
        },
        renderEnginesSupported: ['V-Ray', 'Corona', 'Lumion', 'Twinmotion', 'Enscape', 'Blender Cycles', '3ds Max'],
        downloadTimestamp: new Date().toISOString(),
        platform: 'SeramikBak ArchStudio 4K BIM Vault'
      };

      const filename = `${safeBrand}_${safeProduct}_4K_Textures.json`;

      return new NextResponse(JSON.stringify(textureManifest, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }
  } catch (error) {
    console.error('Download asset error:', error);
    return new NextResponse('İndirme oluşturulurken hata: ' + error.message, { status: 500 });
  }
}
