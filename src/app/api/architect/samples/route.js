import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: List sample orders requested by the architect
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const architectId = searchParams.get('architectId');

    if (!architectId) {
      return NextResponse.json({ error: 'architectId gerekli.' }, { status: 400 });
    }

    const samples = await prisma.architectSample.findMany({
      where: { architectId },
      include: {
        product: {
          include: {
            brand: { select: { id: true, name: true, logoUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, samples });
  } catch (err) {
    console.error('Fetch architect samples error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Request new sample box for selected product(s)
export async function POST(request) {
  try {
    const body = await request.json();
    const { architectId, productIds, officeAddress, city, notes, projectName } = body;

    if (!architectId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Mimar ID ve en az bir ürün seçilmelidir.' }, { status: 400 });
    }

    if (!officeAddress || !city) {
      return NextResponse.json({ error: 'Teslimat için ofis adresi ve şehir zorunludur.' }, { status: 400 });
    }

    // Get architect details
    const architect = await prisma.architect.findUnique({
      where: { id: architectId }
    });

    if (!architect) {
      return NextResponse.json({ error: 'Mimar profili bulunamadı.' }, { status: 404 });
    }

    const createdSamples = [];

    for (const productId of productIds) {
      // 1. Create ArchitectSample record
      const sample = await prisma.architectSample.create({
        data: {
          architectId,
          productId,
          officeAddress: officeAddress.trim(),
          city: city.trim(),
          notes: notes ? notes.trim() : null,
          status: 'PENDING'
        },
        include: {
          product: {
            include: { brand: { select: { id: true, name: true } } }
          }
        }
      });
      createdSamples.push(sample);

      // 2. Also register a SpecInLead for the Brand Portal radar!
      const prod = await prisma.product.findUnique({
        where: { id: productId },
        select: { brandId: true, name: true }
      });

      if (prod && prod.brandId) {
        try {
          await prisma.specInLead.create({
            data: {
              brandId: prod.brandId,
              productId: productId,
              officeName: architect.officeName,
              architectName: architect.name,
              email: architect.email,
              phone: architect.phone,
              city: city,
              projectType: 'Mimari Numune Kutusu',
              projectName: projectName || 'Numune İnceleme & Şartname Hazırlığı',
              fileType: 'NUMUNE_KUTUSU_TALEBI',
              status: 'SPEC_IN',
              notes: `Numune Kutusu Talebi: ${architect.officeName} (${architect.name}). Teslimat Adresi: ${officeAddress}. Notlar: ${notes || '-'}`
            }
          });
        } catch (specErr) {
          console.warn('Could not sync to SpecInLead:', specErr.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdSamples.length} adet karo için numune kutusu talebiniz alındı. İlgili üretici fabrikalara sevk emri iletildi.`,
      samples: createdSamples
    });

  } catch (err) {
    console.error('Create architect sample error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
