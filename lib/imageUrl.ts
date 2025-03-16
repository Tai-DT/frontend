/**
 * Takes a URL path from Strapi and ensures it's properly formatted
 * for use with Next.js Image component
 */
export function getStrapiImageUrl(url: string | undefined): string {
  if (!url) {
    return '/placeholder-image.png';
  }

  // Check if it's already an absolute URL with http/https
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Check if the URL already includes the backend URL
  const backendUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || '';
  if (url.startsWith(backendUrl)) {
    return url;
  }

  // Make sure we're not duplicating the URL path
  if (url.startsWith('/')) {
    return `${backendUrl}${url}`;
  }

  return `${backendUrl}/${url}`;
}
