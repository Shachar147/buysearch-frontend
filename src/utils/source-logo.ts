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
    case 'terminalx.com':
      return 'https://upload.wikimedia.org/wikipedia/he/4/44/Terminal_X_logo.png';
    // Add more sources here as needed
    default:
      return undefined;
  }
} 