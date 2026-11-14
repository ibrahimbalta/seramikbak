import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request) {
  try {
    // Query rate limit: Max 30 status queries per minute per IP
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`proj_status_${clientIp}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Çok sık sorgulama yapıldı. Lütfen 1 dakika bekleyin.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('code') || searchParams.get('id') || '';

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Lütfen proje takip kodu veya kayıtlı e-posta adresinizi girin.' },
        { status: 400 }
      );
    }

    const trimmed = query.trim();
    if (trimmed.length < 6) {
      return NextResponse.json(
        { error: 'Lütfen geçerli bir proje takip kodu (en az 6 karakter), e-posta veya tam telefon numarası girin.' },
        { status: 400 }
      );
    }

    // 1. Direct ID match
    let project = await prisma.projectRequest.findUnique({
      where: { id: trimmed }
    });

    // 2. Search by contactEmail if email provided
    if (!project && trimmed.includes('@')) {
      project = await prisma.projectRequest.findFirst({
        where: { contactEmail: { equals: trimmed, mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' }
      });
    }

    // 3. Search by full phone number (10+ digits) or long ID prefix (8+ chars) to prevent enumeration
    if (!project) {
      const cleanPhone = trimmed.replace(/\D/g, '');
      const orClauses = [];
      if (cleanPhone.length >= 10) {
        orClauses.push({ contactPhone: { contains: cleanPhone.slice(-10) } });
      }
      if (trimmed.length >= 8) {
        orClauses.push({ id: { startsWith: trimmed } });
      }
      if (orClauses.length > 0) {
        project = await prisma.projectRequest.findFirst({
          where: { OR: orClauses },
          orderBy: { createdAt: 'desc' }
        });
      }
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Girilen bilgilere ait aktif bir proje talebi bulunamadı.' },
        { status: 404 }
      );
    }

    const maskText = (val) => {
      if (!val || typeof val !== 'string') return '***';
      return val.split(' ').map(w => w.length <= 2 ? w[0] + '*' : w.slice(0, 2) + '***').join(' ');
    };

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        projectName: project.projectName,
        companyName: maskText(project.companyName),
        contactName: maskText(project.contactName),
        city: project.city,
        district: project.district,
        projectType: project.projectType,
        constructionStep: project.constructionStep,
        quantityM2: project.quantityM2,
        budgetM2: project.budgetM2,
        deliveryTimeline: project.deliveryTimeline,
        ceramicStyles: project.ceramicStyles,
        ceramicSizes: project.ceramicSizes,
        usageAreas: project.usageAreas,
        status: project.status,
        createdAt: project.createdAt
      }
    });
  } catch (err) {
    console.error('Project status tracking error:', err);
    return NextResponse.json(
      { error: 'Sorgulama sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}
