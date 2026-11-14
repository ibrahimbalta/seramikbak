import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-check';
import { encryptSession, decryptSession } from '@/lib/session';

const GITHUB_REPO = process.env.GITHUB_REPO || 'ibrahimbalta/seramikbak';
const CI_WORKFLOW_FILE = 'ci.yml';

async function fetchGitHubRuns() {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'SeramikBak-Admin-Monitor'
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${CI_WORKFLOW_FILE}/runs?per_page=5`,
      { headers, cache: 'no-store', signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) {
      return {
        available: false,
        status: res.status,
        error: res.status === 404
          ? 'CI workflow henüz GitHub üzerinde bulunamadı veya repo özel (GITHUB_TOKEN gerekir).'
          : `GitHub API yanıtı: HTTP ${res.status}`,
        runs: []
      };
    }
    const data = await res.json();
    const runs = (data.workflow_runs || []).map((r) => ({
      id: r.id,
      runNumber: r.run_number,
      status: r.status,
      conclusion: r.conclusion,
      event: r.event,
      branch: r.head_branch,
      commitSha: r.head_sha ? r.head_sha.slice(0, 7) : '-',
      commitMessage: r.head_commit?.message?.split('\n')[0] || r.display_title || '-',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      htmlUrl: r.html_url
    }));
    return { available: true, runs };
  } catch (err) {
    return {
      available: false,
      error: `GitHub Actions bağlantısı kurulamadı: ${err.message}`,
      runs: []
    };
  }
}

export async function GET(request) {
  try {
    const auth = await verifyAuth(request, 'admin', 'SUPER_ADMIN');
    if (!auth) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Bu alana yalnızca Süper Admin erişebilir.' },
        { status: 403 }
      );
    }

    const probes = [];

    // 1. Database Connectivity & Latency Probe
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const [brandsCount, productsCount, dealersCount, usersCount] = await Promise.all([
        prisma.brand.count(),
        prisma.product.count(),
        prisma.dealer.count(),
        prisma.user.count()
      ]);
      const dbLatency = Date.now() - dbStart;
      probes.push({
        id: 'database',
        name: 'Veritabanı Bağlantısı (Prisma / LibSQL)',
        status: dbLatency < 1500 ? 'PASS' : 'WARN',
        detail: `${dbLatency} ms • ${brandsCount} marka, ${productsCount} ürün, ${dealersCount} bayi, ${usersCount} üye`
      });
    } catch (dbErr) {
      probes.push({
        id: 'database',
        name: 'Veritabanı Bağlantısı (Prisma / LibSQL)',
        status: 'FAIL',
        detail: dbErr.message
      });
    }

    // 2. Session Encryption Roundtrip Probe (AES-256-GCM)
    try {
      const testToken = encryptSession({ id: 'probe', role: 'admin' });
      const decoded = decryptSession(testToken);
      const ok = Boolean(decoded && decoded.id === 'probe' && decoded.role === 'admin');
      probes.push({
        id: 'session_crypto',
        name: 'Oturum Şifreleme (AES-256-GCM)',
        status: ok ? 'PASS' : 'FAIL',
        detail: ok ? 'Token üretimi ve imza doğrulaması başarılı' : 'Token doğrulama başarısız'
      });
    } catch (cryptoErr) {
      probes.push({
        id: 'session_crypto',
        name: 'Oturum Şifreleme (AES-256-GCM)',
        status: 'FAIL',
        detail: cryptoErr.message
      });
    }

    // 3. Critical Environment Variables Presence (Boolean only, zero secret exposure)
    const requiredEnv = [
      { key: 'SESSION_SECRET', label: 'SESSION_SECRET' },
      { key: 'ADMIN_PASSWORD', label: 'ADMIN_PASSWORD' },
      { key: 'CLOUDINARY_CLOUD_NAME', label: 'CLOUDINARY_CLOUD_NAME' },
      { key: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID', label: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID' },
      { key: 'GITHUB_TOKEN', label: 'GITHUB_TOKEN (Opsiyonel CI Tetikleme)' }
    ];
    const envStatus = requiredEnv.map((e) => ({
      key: e.label,
      configured: Boolean(process.env[e.key] && String(process.env[e.key]).trim().length > 0)
    }));

    const criticalMissing = envStatus.filter(
      (e) => !e.configured && !e.key.includes('Opsiyonel')
    );

    probes.push({
      id: 'env_vars',
      name: 'Ortam Değişkenleri (Secrets)',
      status: criticalMissing.length === 0 ? 'PASS' : 'WARN',
      detail:
        criticalMissing.length === 0
          ? 'Tüm kritik ortam değişkenleri tanımlı'
          : `Eksik değişken(ler): ${criticalMissing.map((x) => x.key).join(', ')}`
    });

    // 4. GitHub Actions CI Status
    const ci = await fetchGitHubRuns();

    return NextResponse.json({
      success: true,
      checkedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      repo: GITHUB_REPO,
      canDispatchCI: Boolean(process.env.GITHUB_TOKEN),
      probes,
      envStatus,
      ci
    });
  } catch (error) {
    console.error('System Monitor GET Error:', error);
    return NextResponse.json(
      { error: 'Sistem monitörü verileri alınamadı.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request, 'admin', 'SUPER_ADMIN');
    if (!auth) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Bu alana yalnızca Süper Admin erişebilir.' },
        { status: 403 }
      );
    }

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          missingGithubToken: true,
          error:
            'Panelden uzaktan CI testi tetiklemek için sunucu ortam değişkenlerine GITHUB_TOKEN (Actions: write yetkili) eklenmelidir. Git push yaptığınızda testler otomatik olarak yine çalışır.'
        },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${CI_WORKFLOW_FILE}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'User-Agent': 'SeramikBak-Admin-Monitor',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ref: 'main' }),
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return NextResponse.json(
        {
          success: false,
          error: `GitHub Actions tetiklenemedi (HTTP ${res.status}). ${errText.slice(0, 180)}`
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      dispatched: true,
      message: 'GitHub Actions Test & Build iş akışı tetiklendi. Sonuçlar birkaç saniye içinde monitörde görünecektir.'
    });
  } catch (error) {
    console.error('System Monitor POST Error:', error);
    return NextResponse.json(
      { error: 'CI iş akışı tetiklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
