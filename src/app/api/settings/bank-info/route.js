import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ['bank_name', 'bank_recipient', 'bank_iban']
        }
      }
    });

    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      bank_name: settingsMap['bank_name'] || 'Akbank',
      bank_recipient: settingsMap['bank_recipient'] || 'SeramikBak Yazılım A.Ş.',
      bank_iban: settingsMap['bank_iban'] || 'TR98 0004 6001 5000 1234 5678 90'
    });
  } catch (error) {
    console.error('Failed to fetch public bank info:', error);
    return NextResponse.json({
      success: false,
      bank_name: 'Akbank',
      bank_recipient: 'SeramikBak Yazılım A.Ş.',
      bank_iban: 'TR98 0004 6001 5000 1234 5678 90'
    }, { status: 200 });
  }
}
