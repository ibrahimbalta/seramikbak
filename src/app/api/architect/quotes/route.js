import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';

// POST: Architect submits a large project B2B wholesale / factory price request
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
    const { 
      architectId, 
      projectId, 
      projectName, 
      projectType, 
      city, 
      totalM2, 
      targetCompletionDate, 
      selectedBrandIds, 
      notes 
    } = body;

    const effectiveArchitectId = (auth.role === 'admin' && architectId) ? architectId : auth.id;
    if (architectId && auth.role !== 'admin' && auth.id !== architectId) {
      return NextResponse.json({ error: 'Başka bir mimar adına fiyat teklifi talebi oluşturamazsınız.' }, { status: 403 });
    }

    if (!effectiveArchitectId || !projectName || !totalM2) {
      return NextResponse.json({ error: 'Mimar ID, proje adı ve toplam m² bilgisi zorunludur.' }, { status: 400 });
    }

    const architect = await prisma.architect.findUnique({
      where: { id: effectiveArchitectId }
    });

    if (!architect) {
      return NextResponse.json({ error: 'Mimar profili bulunamadı.' }, { status: 404 });
    }

    // Determine target brands (or broadcast to all top brands)
    let brandIdsToNotify = selectedBrandIds;
    if (!brandIdsToNotify || brandIdsToNotify.length === 0) {
      const topBrands = await prisma.brand.findMany({ take: 5, select: { id: true } });
      brandIdsToNotify = topBrands.map(b => b.id);
    }

    // Create SpecInLead / Tender record for each brand so it appears in their portal
    const createdLeads = [];
    for (const bId of brandIdsToNotify) {
      const lead = await prisma.specInLead.create({
        data: {
          brandId: bId,
          officeName: architect.officeName,
          architectName: architect.name,
          email: architect.email,
          phone: architect.phone,
          city: city || architect.city,
          projectType: projectType || 'Büyük Ölçekli Karma Proje',
          projectName: `${projectName} (${totalM2} m² Proje Teklifi)`,
          fileType: 'PROJE_FIYAT_TEKLIFI',
          status: 'NEW',
          notes: `B2B PROJE İSKONTOSU TALEBİ:\nOfis: ${architect.officeName}\nYer: ${city || '-'}\nToplam Metraj: ${totalM2} m²\nHedef Teslim: ${targetCompletionDate || 'Belirtilmedi'}\nÖzel Notlar: ${notes || '-'}`
        }
      });
      createdLeads.push(lead);
    }

    return NextResponse.json({
      success: true,
      message: `Proje fiyat teklifi talebiniz ${createdLeads.length} seramik üreticisi markanın B2B masasına ulaştırıldı. En geç 24 saat içinde özel proje iskontolu teklifleriniz hazırlanacaktır.`,
      leadsCount: createdLeads.length
    });

  } catch (err) {
    console.error('Project quote tender error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
