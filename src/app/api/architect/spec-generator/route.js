import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST: Generate official TS EN 14411 technical specification text and export report for a project
export async function POST(request) {
  try {
    const body = await request.json();
    const { projectId, architectId, projectMeta } = body;

    let items = [];
    let projectTitle = projectMeta?.title || 'Mimari Yapı Projesi';
    let projectCity = projectMeta?.city || 'Türkiye';
    let projectType = projectMeta?.projectType || 'Genel Proje';
    let officeName = projectMeta?.officeName || '';
    let authorName = projectMeta?.name || '';

    if (projectId) {
      const project = await prisma.architectProject.findUnique({
        where: { id: projectId },
        include: {
          items: {
            include: {
              product: {
                include: { brand: { select: { name: true } } }
              }
            }
          },
          architect: {
            select: { officeName: true, name: true, phone: true, email: true, chamberNo: true }
          }
        }
      });

      if (project) {
        items = project.items;
        projectTitle = project.title;
        projectCity = project.city;
        projectType = project.projectType;
        if (project.architect?.officeName) officeName = project.architect.officeName;
        if (project.architect?.name) authorName = project.architect.name;
      }
    }

    if (items.length === 0 && Array.isArray(body.products)) {
      // Direct ad-hoc products passed
      items = body.products.map(p => ({
        product: p,
        usageArea: p.usageArea || 'Zemin / Duvar Kaplama',
        areaM2: p.areaM2 || 100
      }));
    }

    // Build TS EN 14411 specification items
    const specClauses = items.map((item, idx) => {
      const p = item.product;
      const brand = p.brand?.name || 'Yerli / İthal Üretici';
      const sizeStr = `${p.width || 60}x${p.height || 120} cm`;
      const finish = p.finish || 'Mat';
      const style = p.style || 'Porselen';
      const pei = p.peiRating ? `PEI ${p.peiRating} (Aşınma Dayanımı)` : 'PEI 4 Yüksek Yaya Trafiği';
      const slip = p.slipResistance || (p.finish === 'Mat' ? 'R10 (DIN 51130 Kaymazlık)' : 'R9');
      const rectified = p.rectified !== false ? 'Rektifiyeli (Lazer Kesim)' : 'Standart Kenar';
      const frost = p.frostResistance !== false ? 'Dona Dayanıklı (TS EN ISO 10545-12)' : 'İç Mekan';
      const thickness = p.thickness ? `${p.thickness} mm` : '9 - 10 mm';

      const clauseText = `
Madde 3.${idx + 1} - ${item.usageArea.toUpperCase()} KAPLAMASI (${p.name}):
A. Malzeme Standardı: TS EN 14411 Grup BIa (Su emme oranı E ≤ %0.5) tam sırlı porselen karo standardına tam haiz olacaktır.
B. Boyut ve Kenar Toleransı: Anma ebatları ${sizeStr}, kalınlık ${thickness} olacaktır. Derz kalınlığını minimuma (1.5 - 2 mm) indirebilmek için karolar ${rectified} olacaktır.
C. Yüzey Özelliği ve Dokusu: ${finish} yüzeyli, ${style} dokulu olacaktır.
D. Mekanik & Emniyet Parametreleri: Yüzey aşınma direnci minimum ${pei}; kayma direnci değeri en az ${slip} sınıfında olacaktır.
E. Kimyasal & Çevresel Mukavemet: Evsel kimyasallara ve lekelenmeye karşı TS EN ISO 10545-13 standardında minimum Sınıf A mukavemetinde; ${frost} olacaktır.
F. Referans Ürün / Emsal: ${brand} - ${p.name} (Kod: ${p.code || 'PRD-' + p.id.slice(0, 8)}) veya idarenin onaylayacağı teknik eşdeğeri.
G. Tahmini Metraj & Fire: ${item.areaM2 || 100} m² (İdarece %8 fire payı ilave edilecektir).
`.trim();

      return {
        clauseNo: `3.${idx + 1}`,
        productName: p.name,
        brandName: brand,
        usageArea: item.usageArea,
        areaM2: item.areaM2,
        clauseText
      };
    });

    const fullSpecDoc = `
T.C. ÇEVRE, ŞEHİRCİLİK VE İKLİM DEĞİŞİKLİĞİ BAKANLIĞI STANDARTLARINA UYGUN
MİMARİ TEKNİK ŞARTNAME & MAHAL LİSTESİ (TS EN 14411)

PROJE ADI: ${projectTitle}
PROJE LOKASYONU: ${projectCity}
YAPI TİPİ: ${projectType}
TARİH: ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
DÜZENLEYEN: ${officeName ? `${officeName} (Mimari Proje Müellifi)` : (authorName ? `${authorName} (Mimari Proje Müellifi)` : 'Mimari Proje Müellifi')}
DURUM: Nihai İhale & Sözleşme Eki

--------------------------------------------------------------------------------
BÖLÜM 1: GENEL HÜKÜMLER VE UYGULAMA KURALLARI
1.1. Bütün seramik ve porselen karolar TS EN 14411 standartlarına uygun 1. sınıf kalitede orijinal ambalajında şantiyeye teslim edilecektir.
1.2. Yapıştırma işleminde C2TE S1 sınıfı yüksek performanslı, esnek çimento esaslı yapıştırıcı kullanılacaktır.
1.3. Rektifiyeli karolarda derz artısı kullanılacak ve minimum derz aralığı 2 mm'den az olmayacaktır.
1.4. Islak hacimlerde seramik öncesi çift kat polimer emülsiyon esaslı elastik su yalıtımı yapılacaktır.

--------------------------------------------------------------------------------
BÖLÜM 2: MAHAL LİSTESİ VE MALZEME ŞARTLARI

${specClauses.map(c => c.clauseText).join('\n\n--------------------------------------------------------------------------------\n\n')}

--------------------------------------------------------------------------------
BÖLÜM 3: KONTROL, KABUL VE NUMUNE ONAYI
3.1. İşe başlanmadan önce yüklenici firma tarafından işbu şartnamede belirlenen karolara ait 15x15 cm ebadında kesit numuneler mimari kontrollüğün yazılı onayına sunulacaktır.
3.2. Renk, tonaj (şarj) ve kalibre farklılıkları olan ürünler şantiyeye kabul edilmeyecektir.
`.trim();

    return NextResponse.json({
      success: true,
      projectTitle,
      totalItems: specClauses.length,
      specClauses,
      fullSpecDoc
    });

  } catch (err) {
    console.error('Spec generator error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
