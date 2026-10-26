import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('code') || searchParams.get('id') || '';

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Lütfen proje takip kodu veya kayıtlı e-posta adresinizi girin.' },
        { status: 400 }
      );
    }

    const trimmed = query.trim();

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

    // 3. Search by phone number or ID prefix
    if (!project) {
      const cleanPhone = trimmed.replace(/\D/g, '');
      project = await prisma.projectRequest.findFirst({
        where: {
          OR: [
            ...(cleanPhone.length >= 7 ? [{ contactPhone: { contains: cleanPhone } }] : []),
            { id: { startsWith: trimmed } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Girilen bilgilere ait aktif bir proje talebi bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        projectName: project.projectName,
        companyName: project.companyName,
        contactName: project.contactName,
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
