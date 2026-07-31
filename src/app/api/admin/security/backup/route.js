import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request, 'admin');
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    // Export all critical database collections for backup
    const [
      brands,
      products,
      dealers,
      dealerSaas,
      leads,
      campaigns,
      analytics,
      projects,
      systemSettings,
      dealerInventories,
      outletListings,
      installers
    ] = await Promise.all([
      prisma.brand.findMany(),
      prisma.product.findMany(),
      prisma.dealer.findMany(),
      prisma.dealerSaaSConfig.findMany(),
      prisma.lead.findMany(),
      prisma.adCampaign.findMany(),
      prisma.analyticsLog.findMany({ take: 1000, orderBy: { createdAt: 'desc' } }),
      prisma.projectRequest.findMany(),
      prisma.systemSetting.findMany(),
      prisma.dealerInventory.findMany(),
      prisma.outletListing.findMany(),
      prisma.installer.findMany()
    ]);

    const backupData = {
      meta: {
        appName: 'SeramikBak',
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        counts: {
          brands: brands.length,
          products: products.length,
          dealers: dealers.length,
          leads: leads.length,
          projects: projects.length,
          installers: installers.length,
          outletListings: outletListings.length
        }
      },
      data: {
        brands,
        products,
        dealers,
        dealerSaas,
        leads,
        campaigns,
        analytics,
        projects,
        systemSettings,
        dealerInventories,
        outletListings,
        installers
      }
    };

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `seramikbak-db-backup-${dateStr}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Backup API Error:', error);
    return NextResponse.json({ error: 'Yedek oluşturulurken hata oluştu.' }, { status: 500 });
  }
}
