import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch all project requests for admin
export async function GET() {
  try {
    const projects = await prisma.projectRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Admin Fetch Projects API Error:', error);
    return NextResponse.json(
      { error: 'Proje talepleri yüklenemedi.', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Update project status or edit details
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id ve status alanları zorunludur.' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum değeri.' },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.projectRequest.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      message: 'Proje talebi durumu başarıyla güncellendi.',
      project: updatedProject
    });
  } catch (error) {
    console.error('Admin Update Project API Error:', error);
    return NextResponse.json(
      { error: 'Proje durumu güncellenemedi.', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete project request
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id parametresi zorunludur.' },
        { status: 400 }
      );
    }

    await prisma.projectRequest.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Proje talebi başarıyla silindi.'
    });
  } catch (error) {
    console.error('Admin Delete Project API Error:', error);
    return NextResponse.json(
      { error: 'Proje silinemedi.', details: error.message },
      { status: 500 }
    );
  }
}
