import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendLeadNotification } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      productId, 
      dealerId, 
      clientName, 
      clientPhone, 
      clientEmail, 
      notes,
      requestedUsta,
      requestedArchitect,
      projectDimensions,
      projectPhotoUrl
    } = body;

    // Validate inputs
    if (!productId || !dealerId || !clientName || !clientPhone || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields (productId, dealerId, clientName, clientPhone, clientEmail)' },
        { status: 400 }
      );
    }

    // Verify product and dealer exist
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId }
    });

    if (!product || !dealer) {
      return NextResponse.json(
        { error: 'Product or Dealer not found' },
        { status: 404 }
      );
    }

    // Create the lead record
    const lead = await prisma.lead.create({
      data: {
        productId,
        dealerId,
        clientName,
        clientPhone,
        clientEmail,
        notes: notes || '',
        requestedUsta: !!requestedUsta,
        requestedArchitect: !!requestedArchitect,
        projectDimensions: projectDimensions || null,
        projectPhotoUrl: projectPhotoUrl || null,
        status: 'PENDING'
      }
    });

    // Log the lead creation action in analytics
    await prisma.analyticsLog.create({
      data: {
        action: 'LEAD',
        productId: productId,
        brandId: product.brandId,
        city: dealer.city || 'İstanbul'
      }
    });

    // Send email notification to seramikbak@gmail.com and dealer
    sendLeadNotification({
      name: clientName,
      phone: clientPhone,
      city: dealer.city,
      notes: notes || '',
      dealerName: dealer.name,
      dealerEmail: dealer.email,
      productName: product.name
    }).catch(err => {
      console.error('Lead email notification trigger error:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully to dealer',
      leadId: lead.id
    });
  } catch (error) {
    console.error('Create Lead API Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit lead', details: error.message },
      { status: 500 }
    );
  }
}
