/**
 * Returns the logo URL for a given source name.
 * @param source string (e.g. 'asos.com')
 * @returns logo URL or undefined
 */
export default function getSourceLogo(source?: string): string | undefined {
  if (!source) return undefined;
  const normalized = source.trim().toLowerCase();
  switch (normalized) {
    case 'asos':
      return 'https://buysearch.s3.eu-north-1.amazonaws.com/logos/asos.png';
    case 'terminalx':
      return 'https://buysearch.s3.eu-north-1.amazonaws.com/logos/terminalx.png';
    case 'factory54':
      return 'https://buysearch.s3.eu-north-1.amazonaws.com/logos/factory54.png';
    case 'itaybrands':
      return 'https://buysearch.s3.eu-north-1.amazonaws.com/logos/itaybrands.png';
    // Add more sources here as needed
    default:
      return undefined;
  }
} 