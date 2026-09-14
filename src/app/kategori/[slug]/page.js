import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CATEGORY_DEFINITIONS } from '@/lib/categories';
import CategoryPageClient from './CategoryPageClient';

export async function generateStaticParams() {
  return Object.keys(CATEGORY_DEFINITIONS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    const cat = CATEGORY_DEFINITIONS[slug];

    if (!cat) {
      return {
        title: "Seramik Kategorileri & Modelleri | SeramikBak",
        description: "Türkiye'nin yetkili üreticilerinden seramik ve porselen karo koleksiyonları."
      };
    }

    const canonicalUrl = `https://www.seramikbak.com/kategori/${slug}`;

    return {
      title: cat.metaTitle,
      description: cat.metaDescription,
      keywords: cat.keywords,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: cat.metaTitle,
        description: cat.metaDescription,
        url: canonicalUrl,
        type: 'website',
        locale: 'tr_TR',
        siteName: 'SeramikBak',
        images: [
          {
            url: 'https://www.seramikbak.com/logo.png',
            width: 1200,
            height: 630,
            alt: cat.title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: cat.metaTitle,
        description: cat.metaDescription
      },
      robots: {
        index: true,
        follow: true
      }
    };
  } catch (error) {
    console.error('generateMetadata Category Error:', error);
    return {
      title: "Seramik Kategorisi | SeramikBak"
    };
  }
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const category = CATEGORY_DEFINITIONS[slug];

  if (!category) {
    notFound();
  }

  // Build Prisma where query based on category definition
  const where = {};
  if (category.filter.areaContains) {
    where.area = { contains: category.filter.areaContains };
  }
  if (category.filter.style) {
    where.style = { equals: category.filter.style, mode: 'insensitive' };
  }
  if (category.filter.width && category.filter.height) {
    where.width = category.filter.width;
    where.height = category.filter.height;
  }
  if (category.filter.frostResistance !== undefined) {
    where.frostResistance = category.filter.frostResistance;
  }

  let products = [];
  try {
    products = await prisma.product.findMany({
      where,
      include: { brand: true },
      take: 60,
      orderBy: { createdAt: 'desc' }
    });

    // If filter returns very few products, fallback to popular products
    if (products.length === 0) {
      products = await prisma.product.findMany({
        include: { brand: true },
        take: 24,
        orderBy: { createdAt: 'desc' }
      });
    }
  } catch (err) {
    console.error('Category products fetch error:', err);
  }

  const canonicalUrl = `https://www.seramikbak.com/kategori/${slug}`;

  // CollectionPage Schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.title,
    "description": category.metaDescription,
    "url": canonicalUrl
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Anasayfa",
        "item": "https://www.seramikbak.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Kategoriler",
        "item": "https://www.seramikbak.com"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": category.h1,
        "item": canonicalUrl
      }
    ]
  };

  // FAQ Schema
  const faqSchema = category.faqs && category.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": category.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  } : null;

  const otherCategories = Object.values(CATEGORY_DEFINITIONS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <CategoryPageClient
        category={category}
        products={products}
        otherCategories={otherCategories}
      />
    </>
  );
}
