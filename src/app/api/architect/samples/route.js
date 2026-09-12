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
      // 1. Fetch product and its brand
      const prod = await prisma.product.findUnique({
        where: { id: productId },
        include: { brand: { select: { id: true, name: true } } }
      });

      // 2. Find nearest authorized dealer for this brand in the architect's city
      let matchedDealer = null;
      if (prod?.brandId) {
        try {
          matchedDealer = await prisma.dealer.findFirst({
            where: {
              brandId: prod.brandId,
              status: 'APPROVED',
              city: { contains: city.trim(), mode: 'insensitive' }
            }
          });

          // Fallback: If no dealer in that specific city, find any approved dealer of this brand
          if (!matchedDealer) {
            matchedDealer = await prisma.dealer.findFirst({
              where: {
                brandId: prod.brandId,
                status: 'APPROVED'
              }
            });
          }
        } catch (dealerErr) {
          console.warn('Dealer lookup failed:', dealerErr.message);
        }
      }

      // 3. Create ArchitectSample record with assigned dealer information
      const assignedDealerLabel = matchedDealer 
        ? `Yetkili Bayi: ${matchedDealer.name} (${matchedDealer.city})` 
        : 'Üretici Fabrika Doğrudan Sevk';

      const sample = await prisma.architectSample.create({
        data: {
          architectId,
          productId,
          officeAddress: officeAddress.trim(),
          city: city.trim(),
          notes: notes ? notes.trim() : null,
          status: 'PENDING',
          cargoCompany: assignedDealerLabel,
          trackingNo: matchedDealer ? `Bayi Tel: ${matchedDealer.phone || '-'}` : 'Fabrika Sevk Sırasında'
        },
        include: {
          product: {
            include: { brand: { select: { id: true, name: true } } }
          }
        }
      });
      createdSamples.push(sample);

      // 4. Send Lead to the Assigned Dealer's Portal (/bayi)
      if (matchedDealer) {
        try {
          await prisma.lead.create({
            data: {
              productId: productId,
              dealerId: matchedDealer.id,
              clientName: `${architect.officeName} (${architect.name})`,
              clientPhone: architect.phone || '-',
              clientEmail: architect.email,
              notes: `📦 [MİMARİ NUMUNE KUTUSU TALEBİ] Ofis: ${architect.officeName}, Mimar: ${architect.name}. Teslimat Adresi: ${officeAddress}, ${city}. ${projectName ? `Proje: ${projectName}. ` : ''}${notes ? `Mimar Notu: ${notes}. ` : ''}Lütfen numuneyi 24 saat içinde mimarın ofisine ulaştırarak projeyi showroom'unuza bağlayın!`,
              status: 'PENDING',
              requestedArchitect: true,
              projectDimensions: '15x15 Kesit Numune Kutusu'
            }
          });

          await prisma.sampleOrder.create({
            data: {
              productId: productId,
              dealerId: matchedDealer.id,
              clientName: `${architect.officeName} - ${architect.name}`,
              clientPhone: architect.phone || '-',
              clientEmail: architect.email,
              city: city.trim(),
              district: matchedDealer.district || architect.city || city.trim(),
              address: officeAddress.trim(),
              notes: `[Mimari Numune] Ofis: ${architect.officeName}. Proje: ${projectName || 'Mimari Tasarım'}. Not: ${notes || '-'}`,
              status: 'PENDING'
            }
          });
        } catch (leadErr) {
          console.warn('Could not sync to dealer lead:', leadErr.message);
        }
      }

      // 5. Send SpecInLead to the Manufacturer / Brand Portal (/marka)
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
              notes: `📦 Mimari Numune Talebi: ${architect.officeName} (${architect.name}). Teslimat: ${officeAddress}, ${city}. ${matchedDealer ? `En Yakın Yetkili Bayiye İletildi: ${matchedDealer.name} (${matchedDealer.city} - Tel: ${matchedDealer.phone || ''})` : 'Doğrudan Fabrika Sevk'}. ${notes ? `Mimar Notu: ${notes}` : ''}`
            }
          });
        } catch (specErr) {
          console.warn('Could not sync to SpecInLead:', specErr.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdSamples.length} adet karo için numune talebiniz alındı. Şehrinizdeki en yakın yetkili bayiye ve üretici fabrika portalına eşzamanlı sevk emri iletildi.`,
      samples: createdSamples
    });

  } catch (err) {
    console.error('Create architect sample error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
