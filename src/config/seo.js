export const SITE_NAME = 'EliteTCG';
export const SITE_URL = 'https://www.elitetcg.co.za';
export const DEFAULT_DESCRIPTION = "South Africa's premier destination for authentic Pokemon TCG products. Shop booster boxes, ETBs, singles, and more.";
export const DEFAULT_IMAGE = 'https://vqtgpgbifsiokmvwgubh.supabase.co/storage/v1/object/public/images/og-default.webp';

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EliteTCG',
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512.png`,
  description: DEFAULT_DESCRIPTION,
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'admin@elitetcg.co.za',
    contactType: 'customer service',
  },
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'EliteTCG',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const buildProductJsonLd = (product) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description || '',
  image: product.images?.[0] || DEFAULT_IMAGE,
  sku: product.sku || undefined,
  brand: {
    '@type': 'Brand',
    name: 'Pokemon TCG',
  },
  offers: {
    '@type': 'Offer',
    url: `${SITE_URL}/product/${product.slug || product.id}`,
    priceCurrency: 'ZAR',
    price: product.price,
    availability: product.inventory?.quantity > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'EliteTCG',
    },
  },
  ...(product.rating && product.review_count > 0 ? {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
    },
  } : {}),
});

export const buildBreadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url ? `${SITE_URL}${item.url}` : undefined,
  })),
});

export const buildFaqJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
});
