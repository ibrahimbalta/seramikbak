import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 1. POST: Register new BIM/CAD Spec-In Download Lead
export async function POST(request) {
  try {
    const body = await request.json();
    let { 
      brandId, 
      productId, 
      officeName, 
      architectName, 
      email, 
      phone, 
      city = 'İstanbul', 
      projectType = 'Konut', 
      projectName = '', 
      fileType = 'REVIT_BIM',
      notes = ''
    } = body;

    if (!officeName || !architectName || !phone) {
      return NextResponse.json({
        success: false,
        error: 'Mimarlık ofisi, yetkili mimar adı ve telefon numarası zorunludur.'
      }, { status: 400 });
    }

    // If brandId is missing but productId exists, lookup brandId from Product
    if (!brandId && productId) {
      const prod = await prisma.product.findUnique({
        where: { id: productId },
        select: { brandId: true }
      });
      if (prod) brandId = prod.brandId;
    }

    if (!brandId) {
      // Fallback to first available brand if not specified
      const firstBrand = await prisma.brand.findFirst();
      if (firstBrand) brandId = firstBrand.id;
    }

    // Create SpecInLead record in database
    const lead = await prisma.specInLead.create({
      data: {
        brandId,
        productId: productId || null,
        officeName: officeName.trim(),
        architectName: architectName.trim(),
        email: (email || '').trim(),
        phone: phone.trim(),
        city: city.trim(),
        projectType: projectType.trim(),
        projectName: (projectName || '').trim(),
        fileType: fileType.trim(),
        status: 'NEW',
        notes: (notes || '').trim()
      },
      include: {
        product: { select: { name: true, code: true } }
      }
    });

    // Also record AnalyticsLog for BIM download
    try {
      await prisma.analyticsLog.create({
        data: {
          action: 'BIM_DOWNLOAD',
          brandId,
          productId: productId || null,
          city: city || 'İstanbul',
          country: 'TR'
        }
      });
    } catch (logErr) {
      console.warn('Could not record analytics log for BIM download:', logErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Şartname ve 4K BIM paketi indirme kaydınız başarıyla oluşturuldu.',
      leadId: lead.id,
      lead
    });

  } catch (error) {
    console.error('SpecInLead POST Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Şartname kaydı oluşturulurken hata: ' + error.message
    }, { status: 500 });
  }
}

// 2. GET: List Spec-In Leads for a brand with analytics summary
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const statusFilter = searchParams.get('status');

    if (!brandId) {
      return NextResponse.json({ success: false, error: 'brandId parametresi gereklidir.' }, { status: 400 });
    }

    const whereClause = { brandId };
    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    // Fetch leads
    const leads = await prisma.specInLead.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            code: true,
            imageUrl: true,
            finish: true,
            style: true,
            width: true,
            height: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Calculate summary statistics
    const totalCount = leads.length;
    const uniqueOfficesSet = new Set(leads.map(l => l.officeName.toLowerCase().trim()));
    const uniqueOfficesCount = uniqueOfficesSet.size;

    const hotLeadsCount = leads.filter(l => l.status === 'NEW' || l.status === 'SPEC_IN').length;
    const wonCount = leads.filter(l => l.status === 'WON').length;

    // Group by product popularity
    const prodCounts = {};
    leads.forEach(l => {
      const prodName = l.product?.name || 'Genel Marka Kataloğu';
      prodCounts[prodName] = (prodCounts[prodName] || 0) + 1;
    });

    const topCollections = Object.entries(prodCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      summary: {
        totalDownloads: totalCount,
        uniqueOffices: uniqueOfficesCount,
        hotLeads: hotLeadsCount,
        wonLeads: wonCount,
        topCollections
      },
      leads
    });

  } catch (error) {
    console.error('SpecInLead GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Şartname verileri alınırken hata: ' + error.message
    }, { status: 500 });
  }
}

// 3. PATCH: Update lead status or notes by brand sales team
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { leadId, status, notes } = body;

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'leadId parametresi zorunludur.' }, { status: 400 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.specInLead.update({
      where: { id: leadId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Şartname kaydı başarıyla güncellendi.',
      lead: updated
    });

  } catch (error) {
    console.error('SpecInLead PATCH Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Güncelleme sırasında hata: ' + error.message
    }, { status: 500 });
  }
}
