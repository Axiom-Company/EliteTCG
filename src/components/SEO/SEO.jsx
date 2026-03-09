import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, DEFAULT_IMAGE } from '../../config/seo';

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd = null,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Premium Pokemon Cards`;
  const canonicalUrl = `${SITE_URL}${path}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_ZA" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </>
  );
};

export default SEO;
