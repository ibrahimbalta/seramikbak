import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Lütfen tüm alanları doldurun.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.' },
        { status: 400 }
      );
    }

    // Create the user (Storing password in plain text for simplicity and seed compatibility,
    // or bcrypt in full production. SQLite seed passwords in the project are stored as plain text)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi başarısız oldu.', details: error.message },
      { status: 500 }
    );
  }
}
