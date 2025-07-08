/**
 * Returns the logo URL for a given source name.
 * @param source string (e.g. 'asos.com')
 * @returns logo URL or undefined
 */
export default function getSourceLogo(source?: string): string | undefined {
  if (!source) return undefined;
  const normalized = source.trim().toLowerCase();
  switch (normalized) {
    case 'asos.com':
      return 'https://www.logo.wine/a/logo/ASOS.com/ASOS.com-Logo.wine.svg';
    // Add more sources here as needed
    default:
      return undefined;
  }
} 