import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to mask name (e.g., "Ahmet Yılmaz" -> "A*** Y***")
function maskName(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => {
      if (word.length <= 1) return word;
      return word[0] + '*'.repeat(Math.min(word.length - 1, 4));
    })
    .join(' ');
}

// Helper to mask phone (e.g., "05321234567" -> "0532 *** ** 67")
function maskPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 7) return '*** ***';
  return clean.slice(0, 4) + ' *** ** ' + clean.slice(-2);
}

// Helper to mask email (e.g., "ahmet@gmail.com" -> "a***@g***.com")
function maskEmail(email) {
  if (!email || !email.includes('@')) return '***@***.com';
  const [local, domain] = email.split('@');
  const maskedLocal = local[0] + '*'.repeat(Math.max(local.length - 1, 3));
  const maskedDomain = domain[0] + '*'.repeat(Math.max(domain.split('.')[0].length - 1, 3)) + '.' + domain.split('.').slice(1).join('.');
  return `${maskedLocal}@${maskedDomain}`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');
    const brandId = searchParams.get('brandId');

    if (!dealerId && !brandId) {
      return NextResponse.json(
        { error: 'Giriş yapan bayiId veya markaId belirtilmelidir.' },
        { status: 400 }
      );
    }

    // Get all approved/active projects (or all PENDING and APPROVED ones for portal view)
    // Only show APPROVED (or PENDING) projects to dealers/brands.
    const projects = await prisma.projectRequest.findMany({
      where: {
        status: { in: ['APPROVED', 'PENDING'] } // Show approved/pending projects to encourage them
      },
      orderBy: { createdAt: 'desc' }
    });

    let userPlan = 'NONE'; // NONE, LITE, STANDART, PREMIUM for dealer; or NONE, BASIC, PRO, ENTERPRISE for brand

    if (dealerId) {
      // Fetch dealer
      const dealer = await prisma.dealer.findUnique({
        where: { id: dealerId }
      });
      if (!dealer) {
        return NextResponse.json({ error: 'Bayi bulunamadı.' }, { status: 404 });
      }

      // Fetch active dealer SaaS config
      const dealerSaas = await prisma.dealerSaaSConfig.findFirst({
        where: {
          dealerId: dealerId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        },
        orderBy: { expiresAt: 'desc' }
      });

      if (dealerSaas) {
        userPlan = dealerSaas.plan; // LITE, STANDART, PREMIUM
      }
    } else if (brandId) {
      // Fetch brand
      const brand = await prisma.brand.findUnique({
        where: { id: brandId }
      });
      if (!brand) {
        return NextResponse.json({ error: 'Marka bulunamadı.' }, { status: 404 });
      }

      // Fetch active brand SaaS config
      const brandSaas = await prisma.saaSConfig.findFirst({
        where: {
          brandId: brandId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        },
        orderBy: { expiresAt: 'desc' }
      });

      if (brandSaas) {
        userPlan = brandSaas.plan; // BASIC, PRO, ENTERPRISE
      }
    }

    // Process and filter/mask projects based on SaaS plans
    const processedProjects = projects.map(proj => {
      const isDealer = !!dealerId;
      
      let isLocked = false;
      let isMasked = false;

      if (isDealer) {
        if (userPlan === 'PREMIUM') {
          // Full access
          isLocked = false;
          isMasked = false;
        } else if (userPlan === 'STANDART') {
          // Masked contact info
          isLocked = false;
          isMasked = true;
        } else {
          // LITE or NONE: Locked details
          isLocked = true;
          isMasked = true;
        }
      } else {
        // Brand access
        if (userPlan === 'ENTERPRISE') {
          isLocked = false;
          isMasked = false;
        } else if (userPlan === 'PRO') {
          isLocked = false;
          isMasked = true;
        } else {
          isLocked = true;
          isMasked = true;
        }
      }

      const maskedProj = {
        id: proj.id,
        projectName: proj.projectName,
        projectType: proj.projectType,
        city: proj.city,
        district: proj.district,
        constructionStep: proj.constructionStep,
        quantityM2: proj.quantityM2,
        budgetM2: proj.budgetM2,
        deliveryTimeline: proj.deliveryTimeline,
        status: proj.status,
        createdAt: proj.createdAt,
        isLocked,
        isMasked
      };

      if (!isLocked) {
        // Standard or full tier gets details
        maskedProj.ceramicStyles = proj.ceramicStyles;
        maskedProj.ceramicSizes = proj.ceramicSizes;
        maskedProj.ceramicColors = proj.ceramicColors;
        maskedProj.ceramicFinishes = proj.ceramicFinishes;
        maskedProj.usageAreas = proj.usageAreas;
        maskedProj.notes = proj.notes;
      } else {
        // Locked fields
        maskedProj.ceramicStyles = '***';
        maskedProj.ceramicSizes = '***';
        maskedProj.ceramicColors = '***';
        maskedProj.ceramicFinishes = '***';
        maskedProj.usageAreas = '***';
        maskedProj.notes = 'Abonelik kilidi aktif. İhtiyaç detaylarını görmek için lütfen paketinizi yükseltin.';
      }

      if (!isMasked && !isLocked) {
        // Premium / Enterprise gets contact details
        maskedProj.companyName = proj.companyName;
        maskedProj.contactName = proj.contactName;
        maskedProj.contactPhone = proj.contactPhone;
        maskedProj.contactEmail = proj.contactEmail;
      } else {
        // Masked contact details
        maskedProj.companyName = proj.companyName ? maskName(proj.companyName) : 'Şirket Bilgisi Maskeli';
        maskedProj.contactName = maskName(proj.contactName);
        maskedProj.contactPhone = maskPhone(proj.contactPhone);
        maskedProj.contactEmail = maskEmail(proj.contactEmail);
      }

      return maskedProj;
    });

    return NextResponse.json({
      success: true,
      userPlan,
      projects: processedProjects
    });
  } catch (error) {
    console.error('List B2B Projects API Error:', error);
    return NextResponse.json(
      { error: 'Proje listesi alınamadı.', details: error.message },
      { status: 500 }
    );
  }
}
