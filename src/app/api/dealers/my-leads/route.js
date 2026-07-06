import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');

    if (!dealerId) {
      return NextResponse.json({ error: 'Missing dealerId query parameter.' }, { status: 400 });
    }

    // Fetch SaaS subscription details for dealer
    const saas = await prisma.dealerSaaSConfig.findFirst({
      where: { dealerId },
      orderBy: { expiresAt: 'desc' }
    });

    const hasActiveSaaS = saas && new Date(saas.expiresAt) > new Date() && saas.status === 'ACTIVE';

    // Fetch leads
    const leads = await prisma.lead.findMany({
      where: { dealerId },
      include: {
        product: {
          select: { name: true, code: true, imageUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Process/redact leads if dealer has no active subscription
    const processedLeads = leads.map(l => {
      if (hasActiveSaaS) {
        return l;
      }
      
      // Mask name: "Ahmet Yilmaz" -> "A**** Y*****"
      const maskedName = l.clientName
        ? l.clientName.split(' ').map(part => {
            if (!part) return '';
            return part[0] + '*'.repeat(Math.max(1, part.length - 1));
          }).join(' ')
        : 'Müşteri';

      // Mask phone
      const maskedPhone = l.clientPhone
        ? l.clientPhone.substring(0, Math.min(4, l.clientPhone.length)) + ' *** ** **'
        : '***';

      // Mask email
      let maskedEmail = '***';
      if (l.clientEmail && l.clientEmail.includes('@')) {
        const [localPart, domain] = l.clientEmail.split('@');
        maskedEmail = (localPart[0] || 'm') + '*'.repeat(Math.max(1, localPart.length - 1)) + '@' + domain;
      }

      return {
        ...l,
        clientName: maskedName,
        clientPhone: maskedPhone,
        clientEmail: maskedEmail,
        notes: 'Abonelik Gerekli - Müşteri notunu görmek ve teklife cevap vermek için lütfen paketinizi etkinleştirin.'
      };
    });

    // Compute stats
    const totalLeads = leads.length;
    const pendingLeads = leads.filter(l => l.status === 'PENDING').length;
    const respondedLeads = leads.filter(l => l.status === 'RESPONDED' || l.status === 'COMPLETED').length;

    // Compute regional analytics based on dealer's city
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { city: true }
    });

    let regionalAnalytics = {
      popularQueries: [],
      popularBrands: [],
      popularStyles: []
    };

    if (dealer && dealer.city) {
      try {
        // Fetch SEARCH logs for this city
        const searchLogs = await prisma.analyticsLog.findMany({
          where: {
            city: { contains: dealer.city },
            action: 'SEARCH'
          },
          take: 150
        });

        const queryCounts = {};
        searchLogs.forEach(log => {
          if (log.query && log.query.trim().length > 1) {
            const q = log.query.trim().toLowerCase();
            queryCounts[q] = (queryCounts[q] || 0) + 1;
          }
        });

        regionalAnalytics.popularQueries = Object.entries(queryCounts)
          .map(([query, count]) => ({ query: query.charAt(0).toUpperCase() + query.slice(1), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Fetch VIEW logs in this city
        const viewLogs = await prisma.analyticsLog.findMany({
          where: {
            city: { contains: dealer.city },
            action: 'VIEW'
          },
          include: {
            product: {
              include: { brand: true }
            }
          },
          take: 200
        });

        const brandCounts = {};
        const styleCounts = {};
        viewLogs.forEach(log => {
          if (log.product) {
            const bName = log.product.brand?.name || 'Qua';
            brandCounts[bName] = (brandCounts[bName] || 0) + 1;

            const sizeStyle = `${log.product.width}x${log.product.height} ${log.product.style || 'Mermer'}`;
            styleCounts[sizeStyle] = (styleCounts[sizeStyle] || 0) + 1;
          }
        });

        regionalAnalytics.popularBrands = Object.entries(brandCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        regionalAnalytics.popularStyles = Object.entries(styleCounts)
          .map(([style, count]) => ({ style, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      } catch (err) {
        console.error('Failed to compute regional analytics:', err);
      }
    }

    return NextResponse.json({
      success: true,
      leads: processedLeads,
      saas: saas ? {
        plan: saas.plan,
        status: saas.status,
        expiresAt: saas.expiresAt
      } : null,
      stats: {
        totalLeads,
        pendingLeads,
        respondedLeads
      },
      regionalAnalytics
    });

  } catch (error) {
    console.error('Dealer My-Leads GET Error:', error);
    return NextResponse.json({ error: 'Talepler yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { leadId, dealerId, status } = body;

    if (!leadId || !dealerId || !status) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    // Check SaaS subscription
    const saas = await prisma.dealerSaaSConfig.findFirst({
      where: { dealerId },
      orderBy: { expiresAt: 'desc' }
    });
    const hasActiveSaaS = saas && new Date(saas.expiresAt) > new Date() && saas.status === 'ACTIVE';
    if (!hasActiveSaaS) {
      return NextResponse.json({ error: 'Teklif durumunu güncelleyebilmek için aktif bir Bayi SaaS aboneliğiniz olmalıdır.' }, { status: 403 });
    }

    // Ensure the lead belongs to this dealer
    const existingLead = await prisma.lead.findFirst({
      where: { id: leadId, dealerId }
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Bu talep size ait değil veya bulunamadı.' }, { status: 404 });
    }

    // Update status
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: { status }
    });

    // Log this status change in AnalyticsLog if it transitioned to RESPONDED
    if (status === 'RESPONDED' || status === 'COMPLETED') {
      await prisma.analyticsLog.create({
        data: {
          action: 'LEAD_RESOLVED',
          productId: existingLead.productId,
          brandId: (await prisma.product.findUnique({ where: { id: existingLead.productId } }))?.brandId || null,
          city: existingLead.clientEmail // or whatever
        }
      });
    }

    return NextResponse.json({ success: true, lead: updatedLead });

  } catch (error) {
    console.error('Dealer My-Leads POST Error:', error);
    return NextResponse.json({ error: 'Talep güncellenirken bir hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const dealerId = searchParams.get('dealerId');

    if (!leadId || !dealerId) {
      return NextResponse.json({ error: 'Missing parameters.' }, { status: 400 });
    }

    // Check SaaS subscription
    const saas = await prisma.dealerSaaSConfig.findFirst({
      where: { dealerId },
      orderBy: { expiresAt: 'desc' }
    });
    const hasActiveSaaS = saas && new Date(saas.expiresAt) > new Date() && saas.status === 'ACTIVE';
    if (!hasActiveSaaS) {
      return NextResponse.json({ error: 'Teklif talebini silebilmek için aktif bir Bayi SaaS aboneliğiniz olmalıdır.' }, { status: 403 });
    }

    // Verify ownership
    const existingLead = await prisma.lead.findFirst({
      where: { id: leadId, dealerId }
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Talep bulunamadı veya silmeye yetkiniz yok.' }, { status: 404 });
    }

    await prisma.lead.delete({
      where: { id: leadId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Dealer My-Leads DELETE Error:', error);
    return NextResponse.json({ error: 'Talep silinirken bir hata oluştu.' }, { status: 500 });
  }
}
