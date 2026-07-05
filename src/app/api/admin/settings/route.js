import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    
    // Map array to key-value object
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    // Provide default fallbacks if missing
    return NextResponse.json({
      bank_name: settingsMap['bank_name'] || 'Akbank',
      bank_recipient: settingsMap['bank_recipient'] || 'SeramikBak Yazılım A.Ş.',
      bank_iban: settingsMap['bank_iban'] || 'TR98 0004 6001 5000 1234 5678 90',
      deepseek_api_key: settingsMap['deepseek_api_key'] || '',
      grok_api_key: settingsMap['grok_api_key'] || '',
      gemini_api_key: settingsMap['gemini_api_key'] || '',
      ai_provider: settingsMap['ai_provider'] || 'deepseek'
    });
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      bank_name, 
      bank_recipient, 
      bank_iban,
      deepseek_api_key,
      grok_api_key,
      gemini_api_key,
      ai_provider
    } = body;

    const settingsToUpdate = [
      { key: 'bank_name', value: bank_name },
      { key: 'bank_recipient', value: bank_recipient },
      { key: 'bank_iban', value: bank_iban },
      { key: 'deepseek_api_key', value: deepseek_api_key },
      { key: 'grok_api_key', value: grok_api_key },
      { key: 'gemini_api_key', value: gemini_api_key },
      { key: 'ai_provider', value: ai_provider }
    ];

    for (const item of settingsToUpdate) {
      if (item.value !== undefined && item.value !== null) {
        await prisma.systemSetting.upsert({
          where: { key: item.key },
          update: { value: String(item.value) },
          create: {
            key: item.key,
            value: String(item.value)
          }
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Failed to update system settings:', error);
    return NextResponse.json({ error: 'Failed to update settings', details: error.message }, { status: 500 });
  }
}
