import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';

/**
 * 1. POST: Public endpoint to submit a quote or sample request from /katalog/[slug]
 */
export async function POST(request) {
  try {
    const body = await request.json();
    let {
      catalogId,
      catalogSlug,
      brandId,
      leadType = 'quote', // 'quote' | 'sample'
      name,
      company = '',
      email,
      phone,
      selectedProducts = [],
      message = ''
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Ad Soyad ve Telefon numarası zorunludur.' },
        { status: 400 }
      );
    }

    // Resolve catalog and brand if brandId is not provided
    let catalog = null;
    if (catalogSlug || catalogId) {
      catalog = await prisma.brandCatalog.findFirst({
        where: catalogSlug ? { publicSlug: catalogSlug } : { id: catalogId },
        select: { id: true, title: true, brandId: true, publicSlug: true }
      });
      if (catalog && !brandId) {
        brandId = catalog.brandId;
      }
    }

    // Fallback brandId
    if (!brandId) {
      const fallbackBrand = await prisma.brand.findFirst({ select: { id: true } });
      if (fallbackBrand) brandId = fallbackBrand.id;
    }

    if (!brandId) {
      return NextResponse.json(
        { success: false, error: 'Marka kimliği doğrulanamadı.' },
        { status: 400 }
      );
    }

    const isSample = leadType === 'sample';
    const catalogTitle = catalog?.title || 'Dijital Katalog';
    const projectType = isSample ? 'Numune Talebi' : 'Fiyat Teklifi';
    const fileType = isSample ? 'CATALOG_SAMPLE' : 'CATALOG_QUOTE';

    // Store rich metadata in notes JSON
    const notesPayload = JSON.stringify({
      source: 'DIGITAL_CATALOG',
      catalogId: catalog?.id || catalogId || null,
      catalogSlug: catalog?.publicSlug || catalogSlug || null,
      catalogTitle,
      leadType,
      selectedProducts: Array.isArray(selectedProducts) ? selectedProducts : [],
      customerMessage: (message || '').trim(),
      submittedAt: new Date().toISOString()
    });

    const lead = await prisma.specInLead.create({
      data: {
        brandId,
        officeName: (company || 'Bireysel / Proje').trim(),
        architectName: name.trim(),
        email: (email || '').trim(),
        phone: phone.trim(),
        city: 'Türkiye',
        projectType,
        projectName: `${catalogTitle} (${selectedProducts.length > 0 ? `${selectedProducts.length} Seçili Ürün` : 'Genel'})`,
        fileType,
        status: 'NEW',
        notes: notesPayload
      }
    });

    // Record analytics log
    try {
      await prisma.analyticsLog.create({
        data: {
          action: isSample ? 'CATALOG_SAMPLE_REQUEST' : 'CATALOG_QUOTE_REQUEST',
          brandId,
          city: 'TR',
          country: 'TR'
        }
      });
    } catch (logErr) {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      message: isSample
        ? 'Numune talebiniz marka yetkilisine başarıyla iletildi.'
        : 'Fiyat teklifi talebiniz marka yetkilisine başarıyla iletildi.',
      leadId: lead.id
    });
  } catch (error) {
    console.error('[Catalog Inquiries POST Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Talep oluşturulurken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * 2. GET: Brand owner endpoint to retrieve all catalog quote & sample requests
 */
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId') || auth.id;

    if (!brandId) {
      return NextResponse.json({ success: false, error: 'Marka kimliği gereklidir.' }, { status: 400 });
    }

    // Role verification
    if (auth.role !== 'admin' && (auth.role !== 'brand' || auth.id !== brandId)) {
      return NextResponse.json(
        { success: false, error: 'Bu markanın tekliflerine erişim yetkiniz bulunmuyor.' },
        { status: 403 }
      );
    }

    const statusFilter = searchParams.get('status'); // 'ALL' | 'NEW' | 'CONTACTED' | 'OFFER_SENT' | 'COMPLETED'
    const typeFilter = searchParams.get('type'); // 'ALL' | 'quote' | 'sample'

    const whereClause = {
      brandId,
      fileType: { in: ['CATALOG_QUOTE', 'CATALOG_SAMPLE'] }
    };

    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    if (typeFilter === 'quote') {
      whereClause.fileType = 'CATALOG_QUOTE';
    } else if (typeFilter === 'sample') {
      whereClause.fileType = 'CATALOG_SAMPLE';
    }

    const rawLeads = await prisma.specInLead.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    // Parse rich metadata from notes
    const inquiries = rawLeads.map((item) => {
      let parsedMeta = {};
      let isJsonNotes = false;
      try {
        if (item.notes && item.notes.trim().startsWith('{')) {
          parsedMeta = JSON.parse(item.notes);
          isJsonNotes = true;
        }
      } catch (e) {
        parsedMeta = {};
      }

      // Safely extract real customer message, never leak raw JSON payload
      let userMsg = '';
      if (typeof parsedMeta.customerMessage === 'string' && parsedMeta.customerMessage.trim()) {
        userMsg = parsedMeta.customerMessage.trim();
      } else if (!isJsonNotes && typeof item.notes === 'string' && !item.notes.trim().startsWith('{')) {
        userMsg = item.notes.trim();
      }

      return {
        id: item.id,
        brandId: item.brandId,
        leadType: item.fileType === 'CATALOG_SAMPLE' ? 'sample' : 'quote',
        typeLabel: item.fileType === 'CATALOG_SAMPLE' ? 'Numune Talebi' : 'Fiyat Teklifi',
        status: item.status, // 'NEW', 'CONTACTED', 'OFFER_SENT', 'COMPLETED'
        customerName: item.architectName,
        companyName: item.officeName,
        email: item.email,
        phone: item.phone,
        catalogTitle: parsedMeta.catalogTitle || item.projectName,
        catalogSlug: parsedMeta.catalogSlug || null,
        catalogId: parsedMeta.catalogId || null,
        selectedProducts: parsedMeta.selectedProducts || [],
        customerMessage: userMsg,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });

    // Compute stats
    const allCatalogLeads = await prisma.specInLead.findMany({
      where: {
        brandId,
        fileType: { in: ['CATALOG_QUOTE', 'CATALOG_SAMPLE'] }
      },
      select: { fileType: true, status: true }
    });

    const stats = {
      total: allCatalogLeads.length,
      newCount: allCatalogLeads.filter((l) => l.status === 'NEW').length,
      quoteCount: allCatalogLeads.filter((l) => l.fileType === 'CATALOG_QUOTE').length,
      sampleCount: allCatalogLeads.filter((l) => l.fileType === 'CATALOG_SAMPLE').length,
      completedCount: allCatalogLeads.filter((l) => l.status === 'COMPLETED').length
    };

    return NextResponse.json({
      success: true,
      inquiries,
      stats
    });
  } catch (error) {
    console.error('[Catalog Inquiries GET Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Teklifler yüklenirken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * 3. PATCH: Update status of an inquiry (e.g. mark as CONTACTED, OFFER_SENT, COMPLETED)
 */
export async function PATCH(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Talep ID ve yeni durum zorunludur.' },
        { status: 400 }
      );
    }

    const existing = await prisma.specInLead.findUnique({
      where: { id },
      select: { brandId: true }
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Talep bulunamadı.' }, { status: 404 });
    }

    // Role check
    if (auth.role !== 'admin' && (auth.role !== 'brand' || auth.id !== existing.brandId)) {
      return NextResponse.json(
        { success: false, error: 'Bu işlemi yapmaya yetkiniz yok.' },
        { status: 403 }
      );
    }

    const updated = await prisma.specInLead.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      message: 'Talep durumu güncellendi.',
      status: updated.status
    });
  } catch (error) {
    console.error('[Catalog Inquiries PATCH Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Güncelleme hatası: ' + error.message },
      { status: 500 }
    );
  }
}
