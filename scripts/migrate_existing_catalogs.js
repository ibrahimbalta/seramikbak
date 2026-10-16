import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Migrating existing catalogs to high-end architectural editorial standard ---');

  const catalogs = await prisma.brandCatalog.findMany({
    select: {
      id: true,
      title: true,
      publicSlug: true,
      template: true,
      productItems: true,
      brand: { select: { name: true, slug: true } }
    }
  });

  for (const c of catalogs) {
    let items = [];
    try {
      items = JSON.parse(c.productItems || '[]');
    } catch (e) {
      items = [];
    }

    let modified = false;

    // 1. If catalog had _metaCustomCanvasPages with dummy demo pages (like cover-milano), clean them out
    // so they don't hijack the HTML editorial template
    items = items.map((item, idx) => {
      if (item && typeof item === 'object') {
        const newItem = { ...item };
        if (newItem._metaCustomCanvasPages && newItem._metaCustomCanvasPages.length > 0) {
          console.log(`[${c.publicSlug}] Cleaning ${newItem._metaCustomCanvasPages.length} stale demo canvas pages.`);
          newItem._metaCustomCanvasPages = [];
          modified = true;
        }
        return newItem;
      }
      return item;
    });

    // 2. If catalog template is 'milano' or unset, upgrade to 'premium-mimari'
    let newTemplate = c.template;
    if (c.template === 'milano' || !c.template) {
      newTemplate = 'premium-mimari';
      modified = true;
      console.log(`[${c.publicSlug}] Upgrading template from '${c.template}' to 'premium-mimari'.`);
    }

    if (modified) {
      await prisma.brandCatalog.update({
        where: { id: c.id },
        data: {
          template: newTemplate,
          productItems: JSON.stringify(items)
        }
      });
      console.log(`✓ Updated [${c.publicSlug}] (${c.brand?.name})`);
    } else {
      console.log(`- Unchanged [${c.publicSlug}] (Template: ${c.template})`);
    }
  }

  console.log('\nMigration complete.');
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
