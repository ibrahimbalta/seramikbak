import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendProjectDemandNotification } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    // Spam/abuse protection: Max 5 project submissions per IP per 15 minutes
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`project_create_${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      const waitMinutes = Math.ceil(rateCheck.resetInMs / 60000);
      return NextResponse.json(
        { error: `Çok fazla proje talebi gönderildi. Lütfen ${waitMinutes} dakika sonra tekrar deneyin.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      companyName,
      contactName,
      contactPhone,
      contactEmail,
      projectName,
      projectType,
      city,
      district,
      constructionStep,
      quantityM2,
      ceramicStyles,
      ceramicSizes,
      ceramicColors,
      ceramicFinishes,
      usageAreas,
      budgetM2,
      deliveryTimeline,
      notes
    } = body;

    // Validation
    if (
      !companyName ||
      !contactName ||
      !contactPhone ||
      !contactEmail ||
      !projectName ||
      !projectType ||
      !city ||
      !district ||
      !constructionStep ||
      !quantityM2 ||
      !ceramicStyles ||
      !ceramicSizes ||
      !usageAreas ||
      !budgetM2 ||
      !deliveryTimeline
    ) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    const m2Int = parseInt(quantityM2, 10);
    if (isNaN(m2Int) || m2Int <= 0) {
      return NextResponse.json(
        { error: 'Metraj miktarı geçerli pozitif bir sayı olmalıdır.' },
        { status: 400 }
      );
    }

    // Create the project request
    const projectRequest = await prisma.projectRequest.create({
      data: {
        companyName,
        contactName,
        contactPhone,
        contactEmail,
        projectName,
        projectType,
        city,
        district,
        constructionStep,
        quantityM2: m2Int,
        ceramicStyles,
        ceramicSizes,
        ceramicColors: ceramicColors || '',
        ceramicFinishes: ceramicFinishes || '',
        usageAreas,
        budgetM2,
        deliveryTimeline,
        notes: notes || '',
        status: 'PENDING'
      }
    });

    // Send email notification to seramikbak@gmail.com
    sendProjectDemandNotification({
      companyName,
      contactName,
      contactPhone,
      contactEmail,
      projectName,
      city,
      quantityM2: m2Int,
      budgetM2
    }).catch(err => {
      console.error('Project demand email notification trigger error:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Proje talebiniz başarıyla alındı ve incelemeye gönderildi.',
      projectId: projectRequest.id
    });
  } catch (error) {
    console.error('Create Project Request API Error:', error);
    return NextResponse.json(
      { error: 'Talep gönderilemedi.', details: error.message },
      { status: 500 }
    );
  }
}
