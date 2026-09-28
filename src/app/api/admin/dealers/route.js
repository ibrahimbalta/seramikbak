import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-check';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'admin' && auth.role !== 'brand')) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryBrandId = searchParams.get('brandId');

    const whereClause = {};
    if (auth.role === 'brand') {
      whereClause.brandId = auth.id;
    } else if (queryBrandId) {
      whereClause.brandId = queryBrandId;
    }

    const dealers = await prisma.dealer.findMany({
      where: whereClause,
      include: {
        brand: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(dealers);
  } catch (error) {
    console.error('Admin Dealers GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dealers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || (auth.role !== 'admin' && auth.role !== 'brand')) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    const body = await request.json();
    const { name, phone, email, password, address, city, district, lat, lng } = body;
    const brandId = auth.role === 'brand' ? auth.id : body.brandId;

    if (!name || !brandId || !phone || !address || !city || !district) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const latitude = parseFloat(lat) || 40.9901;
    const longitude = parseFloat(lng) || 29.0278;

    const initialPassword = password && password.trim() !== '' 
      ? (password.includes(':') ? password : hashPassword(password)) 
      : hashPassword('bayi123');

    const newDealer = await prisma.dealer.create({
      data: {
        name,
        brandId,
        phone,
        email: email || null,
        password: initialPassword,
        address,
        city,
        district,
        lat: latitude,
        lng: longitude
      },
      include: {
        brand: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, dealer: newDealer });
  } catch (error) {
    console.error('Admin Dealers POST Error:', error);
    return NextResponse.json({ error: 'Failed to create dealer', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request, 'admin');
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing dealer id parameter' }, { status: 400 });
    }

    await prisma.dealer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Dealers DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete dealer', details: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen oturum açın.' }, { status: 401 });
    }
    const body = await request.json();
    const { 
      id, 
      name,
      status, 
      phone, 
      email,
      address, 
      city,
      district,
      password, 
      lat, 
      lng, 
      logoUrl, 
      bannerUrl,
      showroomImages, 
      virtualTourUrl, 
      specialConcepts,
      aboutText,
      logisticsServices,
      featuredProducts,
      dealerCampaigns,
      referenceProjects,
      dealerFaqs,
      dealerStats,
      pdfCatalogUrl,
      pdfCatalogName,
      themePreset,
      themePrimary,
      socialInstagram,
      socialFacebook,
      socialLinkedin,
      socialYoutube,
      socialWebsite
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bayi ID eksik.' }, { status: 400 });
    }

    const isAdmin = auth.role === 'admin';
    const isSelfDealer = auth.role === 'dealer' && auth.id === id;
    let isBrandOwner = false;
    if (auth.role === 'brand') {
      const existing = await prisma.dealer.findUnique({
        where: { id },
        select: { brandId: true }
      });
      isBrandOwner = existing && existing.brandId === auth.id;
    }

    if (!isAdmin && !isSelfDealer && !isBrandOwner) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const updateData = {};
    if ((isAdmin || isBrandOwner) && name !== undefined) updateData.name = name;
    if ((isAdmin || isBrandOwner) && status !== undefined) updateData.status = status;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email || null;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (district !== undefined) updateData.district = district;
    if (password !== undefined && password.trim() !== '') {
      updateData.password = password.includes(':') ? password : hashPassword(password);
    }
    if (lat !== undefined) updateData.lat = parseFloat(lat);
    if (lng !== undefined) updateData.lng = parseFloat(lng);
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (showroomImages !== undefined) updateData.showroomImages = showroomImages;
    if (virtualTourUrl !== undefined) updateData.virtualTourUrl = virtualTourUrl;
    if (specialConcepts !== undefined) updateData.specialConcepts = specialConcepts;
    if (aboutText !== undefined) updateData.aboutText = aboutText;
    if (logisticsServices !== undefined) updateData.logisticsServices = logisticsServices;
    if (featuredProducts !== undefined) updateData.featuredProducts = featuredProducts;
    if (dealerCampaigns !== undefined) updateData.dealerCampaigns = dealerCampaigns;
    if (referenceProjects !== undefined) updateData.referenceProjects = referenceProjects;
    if (dealerFaqs !== undefined) updateData.dealerFaqs = dealerFaqs;
    if (dealerStats !== undefined) updateData.dealerStats = dealerStats;
    if (pdfCatalogUrl !== undefined) updateData.pdfCatalogUrl = pdfCatalogUrl;
    if (pdfCatalogName !== undefined) updateData.pdfCatalogName = pdfCatalogName;
    if (themePreset !== undefined) updateData.themePreset = themePreset;
    if (themePrimary !== undefined) updateData.themePrimary = themePrimary;
    if (socialInstagram !== undefined) updateData.socialInstagram = socialInstagram;
    if (socialFacebook !== undefined) updateData.socialFacebook = socialFacebook;
    if (socialLinkedin !== undefined) updateData.socialLinkedin = socialLinkedin;
    if (socialYoutube !== undefined) updateData.socialYoutube = socialYoutube;
    if (socialWebsite !== undefined) updateData.socialWebsite = socialWebsite;

    const updatedDealer = await prisma.dealer.update({
      where: { id },
      data: updateData,
      include: {
        brand: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, dealer: updatedDealer });
  } catch (error) {
    console.error('Admin Dealers PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update dealer', details: error.message }, { status: 500 });
  }
}

