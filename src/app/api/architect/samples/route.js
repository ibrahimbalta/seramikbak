import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPushNotification } from '@/lib/pushServer';
import { verifyAuth } from '@/lib/auth-check';

// GET: List sample orders requested by the architect
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli. Lütfen giriş yapın.' }, { status: 401 });
    }

    if (auth.role !== 'architect' && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Bu işlem için mimar yetkisi gereklidir.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryArchitectId = searchParams.get('architectId');

    const effectiveArchitectId = (auth.role === 'admin' && queryArchitectId) ? queryArchitectId : auth.id;

    if (queryArchitectId && auth.role !== 'admin' && auth.id !== queryArchitectId) {
      return NextResponse.json({ error: 'Bu verilere erişim yetkiniz bulunmuyor.' }, { status: 403 });
    }

    const samples = await prisma.architectSample.findMany({
      where: { architectId: effectiveArchitectId },
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
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli. Lütfen giriş yapın.' }, { status: 401 });
    }

    if (auth.role !== 'architect' && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Bu işlem için mimar yetkisi gereklidir.' }, { status: 403 });
    }

    const body = await request.json();
    const { architectId, productIds, officeAddress, city, notes, projectName, neededM2 } = body;

    const effectiveArchitectId = (auth.role === 'admin' && architectId) ? architectId : auth.id;
    if (architectId && auth.role !== 'admin' && auth.id !== architectId) {
      return NextResponse.json({ error: 'Başka bir mimar adına talep oluşturamazsınız.' }, { status: 403 });
    }

    if (!effectiveArchitectId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Mimar ID ve en az bir ürün seçilmelidir.' }, { status: 400 });
    }

    if (!officeAddress || !city) {
      return NextResponse.json({ error: 'Teslimat için ofis adresi ve şehir zorunludur.' }, { status: 400 });
    }

    // Get architect details
    const architect = await prisma.architect.findUnique({
      where: { id: effectiveArchitectId }
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
          architectId: effectiveArchitectId,
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

      // Determine needed m2 from input or project item
      let effectiveM2 = neededM2 ? parseFloat(neededM2) : null;
      if (!effectiveM2 && effectiveArchitectId && productId) {
        try {
          const item = await prisma.architectProjectItem.findFirst({
            where: {
              productId: productId,
              project: { architectId: effectiveArchitectId }
            },
            select: { areaM2: true, project: { select: { totalAreaM2: true } } }
          });
          if (item) {
            effectiveM2 = item.areaM2 || item.project?.totalAreaM2;
          }
        } catch (m2Err) {
          console.warn('Could not resolve project areaM2:', m2Err.message);
        }
      }

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
              notes: `📦 [MİMARİ NUMUNE KUTUSU TALEBİ] Ofis: ${architect.officeName}, Mimar: ${architect.name}. ${effectiveM2 ? `[PROJE İHTİYAÇ METRAJI: ${effectiveM2} m²] ` : ''}Teslimat Adresi: ${officeAddress}, ${city}. ${projectName ? `Proje: ${projectName}. ` : ''}${notes ? `Mimar Notu: ${notes}. ` : ''}Lütfen numuneyi 24 saat içinde mimarın ofisine ulaştırarak projeyi showroom'unuza bağlayın!`,
              status: 'PENDING',
              requestedArchitect: true,
              projectDimensions: effectiveM2 ? `${effectiveM2} m² İhtiyaç` : '15x15 Kesit Numune Kutusu'
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
              notes: `[Mimari Numune] Ofis: ${architect.officeName}. Proje: ${projectName || 'Mimari Tasarım'}. ${effectiveM2 ? `İhtiyaç: ${effectiveM2} m². ` : ''}Not: ${notes || '-'}`,
              status: 'PENDING'
            }
          });

          // Send Web Push to the matched dealer
          sendPushNotification({
            userType: 'DEALER',
            userId: matchedDealer.id,
            title: '📦 Yeni Mimari Numune Talebi!',
            body: `${architect.officeName} (${city}) bir numune kutusu talep etti. Hemen inceleyin!`,
            url: '/bayi'
          }).catch(pushErr => {
            console.warn('Dealer push notification failed:', pushErr.message);
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
              projectName: projectName 
                ? (effectiveM2 ? `${projectName} (${effectiveM2} m²)` : projectName)
                : (effectiveM2 ? `Mimari Proje (${effectiveM2} m²)` : 'Numune İnceleme & Şartname Hazırlığı'),
              fileType: 'NUMUNE_KUTUSU_TALEBI',
              status: 'SPEC_IN',
              notes: `📦 Mimari Numune Talebi: ${architect.officeName} (${architect.name}). ${effectiveM2 ? `[İHTİYAÇ: ${effectiveM2} m²] ` : ''}Teslimat: ${officeAddress}, ${city}. ${matchedDealer ? `En Yakın Yetkili Bayiye İletildi: ${matchedDealer.name} (${matchedDealer.city} - Tel: ${matchedDealer.phone || ''})` : 'Doğrudan Fabrika Sevk'}. ${notes ? `Mimar Notu: ${notes}` : ''}`
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
