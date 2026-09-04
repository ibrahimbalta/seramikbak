import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { encryptSession } from '@/lib/session';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, username, role } = body;

    // --- Admin Login (DB-based RBAC) ---
    if (role === 'admin' && (username || email) && password) {
      const loginIdentifier = username || email;

      // Find Admin in DB
      let admin = await prisma.adminUser.findFirst({
        where: {
          OR: [
            { username: loginIdentifier },
            { email: loginIdentifier }
          ]
        }
      });

      // Seed default Super Admin from env if DB table is completely empty
      if (!admin) {
        const totalAdmins = await prisma.adminUser.count();
        if (totalAdmins === 0) {
          const envUsername = process.env.ADMIN_USERNAME || 'admin';
          const envPassword = process.env.ADMIN_PASSWORD || '6032.,Elif.';
          
          if (loginIdentifier === envUsername || loginIdentifier === 'admin@seramikbak.com') {
            admin = await prisma.adminUser.create({
              data: {
                username: envUsername,
                email: 'admin@seramikbak.com',
                name: 'Süper Admin',
                password: hashPassword(envPassword),
                role: 'SUPER_ADMIN',
                status: 'ACTIVE'
              }
            });
          }
        }
      }

      if (!admin || admin.status !== 'ACTIVE' || !verifyPassword(password, admin.password)) {
        return NextResponse.json(
          { error: 'Hatalı kullanıcı adı, e-posta veya şifre.' },
          { status: 401 }
        );
      }

      const token = encryptSession({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: 'admin',
        adminRole: admin.role // SUPER_ADMIN, CONTENT_MANAGER, SUPPORT
      });

      const cookieStore = await cookies();
      cookieStore.set('sb_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });

      return NextResponse.json({
        success: true,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          username: admin.username,
          role: 'admin',
          adminRole: admin.role
        },
        token
      });
    }

    // --- Regular User Login (email/password) ---
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Lütfen e-posta ve şifrenizi girin.' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: 'E-posta veya şifre hatalı.' },
        { status: 401 }
      );
    }

    // Generate secure session token
    const token = encryptSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'user',
      emailVerified: user.emailVerified
    });

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set('sb_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified
      },
      token
    });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'Giriş işlemi başarısız oldu.' },
      { status: 500 }
    );
  }
}


