import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { matchCSBPoz } from '@/lib/csbPozMatcher';

// GET: Fetch client presentation data for a specific project (White-label)
export async function GET(request, { params }) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json({ error: 'Proje ID belirtilmedi.' }, { status: 400 });
    }

    const project = await prisma.architectProject.findUnique({
      where: { id: projectId },
      include: {
        architect: {
          select: {
            officeName: true,
            name: true,
            title: true,
            phone: true,
            email: true,
            city: true,
            website: true
          }
        },
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
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Sunum veya proje bulunamadı.' }, { status: 404 });
    }

    // Attach CSB Poz to each item for technical depth
    const enrichedItems = project.items.map(item => {
      const csb = matchCSBPoz(item.product, item.usageArea);
      const isApproved = item.notes?.includes('[ONAYLANDI');
      const hasRevision = item.notes?.includes('[REVİZYON');

      return {
        ...item,
        csbPoz: csb,
        approvalState: isApproved ? 'APPROVED' : (hasRevision ? 'REVISION_REQUESTED' : 'PENDING')
      };
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
        projectType: project.projectType,
        city: project.city,
        totalAreaM2: project.totalAreaM2,
        notes: project.notes,
        status: project.status,
        updatedAt: project.updatedAt,
        architect: project.architect,
        items: enrichedItems
      }
    });

  } catch (err) {
    console.error('Fetch presentation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Client approves a tile selection or submits revision feedback
export async function POST(request, { params }) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { itemId, action, clientName, clientNote } = body;

    if (!itemId || !action) {
      return NextResponse.json({ error: 'itemId ve action (approve | revision) zorunludur.' }, { status: 400 });
    }

    const item = await prisma.architectProjectItem.findUnique({
      where: { id: itemId }
    });

    if (!item || item.projectId !== projectId) {
      return NextResponse.json({ error: 'Proje kalemi bulunamadı.' }, { status: 404 });
    }

    const timestamp = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const author = clientName?.trim() || 'İşveren';

    let formattedNote = '';
    if (action === 'approve') {
      formattedNote = `[ONAYLANDI - ${author} • ${timestamp}] ${clientNote?.trim() ? `Not: ${clientNote.trim()}` : 'Malzeme seçimi işveren tarafından onaylandı.'}`;
    } else {
      formattedNote = `[REVİZYON TALEBİ - ${author} • ${timestamp}] ${clientNote?.trim() || 'Farklı doku/renk alternatifi talep edildi.'}`;
    }

    const updatedItem = await prisma.architectProjectItem.update({
      where: { id: itemId },
      data: { notes: formattedNote }
    });

    // Touch project updatedAt
    await prisma.architectProject.update({
      where: { id: projectId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      action,
      updatedItem,
      message: action === 'approve' ? 'Seçiminiz onaylandı. Mimarlık ofisine iletildi.' : 'Revizyon notunuz mimarlık ofisine iletildi.'
    });

  } catch (err) {
    console.error('Submit client feedback error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
