import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: List all projects of an architect with their products
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const architectId = searchParams.get('architectId');

    if (!architectId) {
      return NextResponse.json({ error: 'architectId gerekli.' }, { status: 400 });
    }

    const projects = await prisma.architectProject.findMany({
      where: { architectId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: { select: { id: true, name: true, logoUrl: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, projects });
  } catch (err) {
    console.error('Fetch architect projects error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new project or add/remove an item
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, architectId, title, projectType, city, totalAreaM2, notes, projectId, productId, usageArea, areaM2, itemId, status } = body;

    // 1. Create New Project
    if (action === 'create_project') {
      if (!architectId || !title) {
        return NextResponse.json({ error: 'Mimar ID ve proje başlığı zorunludur.' }, { status: 400 });
      }

      const project = await prisma.architectProject.create({
        data: {
          architectId,
          title: title.trim(),
          projectType: projectType || 'Konut',
          city: city || 'İstanbul',
          totalAreaM2: totalAreaM2 ? parseFloat(totalAreaM2) : 350,
          notes: notes ? notes.trim() : null,
          status: 'DESIGN'
        }
      });

      return NextResponse.json({ success: true, project });
    }

    // 2. Add Product/Tile to Project
    if (action === 'add_item') {
      if (!projectId || !productId) {
        return NextResponse.json({ error: 'projectId ve productId zorunludur.' }, { status: 400 });
      }

      const item = await prisma.architectProjectItem.create({
        data: {
          projectId,
          productId,
          usageArea: usageArea || 'Zemin Kaplama',
          areaM2: areaM2 ? parseFloat(areaM2) : 100,
          notes: notes ? notes.trim() : null
        },
        include: {
          product: {
            include: { brand: { select: { id: true, name: true } } }
          }
        }
      });

      // Update project updatedAt
      await prisma.architectProject.update({
        where: { id: projectId },
        data: { updatedAt: new Date() }
      });

      return NextResponse.json({ success: true, item });
    }

    // 3. Remove Item from Project
    if (action === 'remove_item') {
      if (!itemId) {
        return NextResponse.json({ error: 'itemId zorunludur.' }, { status: 400 });
      }

      await prisma.architectProjectItem.delete({
        where: { id: itemId }
      });

      return NextResponse.json({ success: true, message: 'Ürün projeden çıkarıldı.' });
    }

    // 4. Update Project Status / Notes
    if (action === 'update_project') {
      if (!projectId) {
        return NextResponse.json({ error: 'projectId zorunludur.' }, { status: 400 });
      }

      const updateData = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (title) updateData.title = title;
      if (totalAreaM2) updateData.totalAreaM2 = parseFloat(totalAreaM2);
      if (city) updateData.city = city;

      const updated = await prisma.architectProject.update({
        where: { id: projectId },
        data: updateData
      });

      return NextResponse.json({ success: true, project: updated });
    }

    // 5. Delete Entire Project
    if (action === 'delete_project') {
      if (!projectId) {
        return NextResponse.json({ error: 'projectId zorunludur.' }, { status: 400 });
      }

      await prisma.architectProject.delete({
        where: { id: projectId }
      });

      return NextResponse.json({ success: true, message: 'Proje başarıyla silindi.' });
    }

    return NextResponse.json({ error: 'Geçersiz işlem tipi.' }, { status: 400 });

  } catch (err) {
    console.error('Architect projects POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
