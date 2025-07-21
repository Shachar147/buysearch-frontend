export enum Source {
  ASOS = 'asos',
  TERMINALX = 'terminalx',
  FACTORY54 = 'factory54',
  ITAYBRANDS = 'itaybrands',
  ZARA = 'zara',
  STORY = 'story',
  ONEPROJECTSHOP = 'oneprojectshop',
  CHOZEN = 'chozen',
  NIKE = 'nike',
  JDSPORTS = 'jdsports',
  GANT = 'gant',
  RENUAR = 'renuar',
  CASTRO = 'castro',
  STOCKX = 'stockx',
  TOMMY_HILFIGER = 'tommy hilfiger',
  ALO_YOGA = 'alo yoga',
  POLO_RALPH_LAUREN = 'polo ralph lauren',
  STYLEFORRENT = 'styleforrent',
}

/**
 * Returns the logo URL for a given source name.
 * @param source string (e.g. 'asos.com')
 * @returns logo URL or undefined
 */
export default function getSourceLogo(source?: string): string | undefined {
  if (!source) return undefined;
  const normalized = source.trim().toLowerCase();
  const S3_URL = 'https://buysearch.s3.eu-north-1.amazonaws.com/logos';
  switch (normalized) {
    case Source.ASOS:
      return `${S3_URL}/asos.png`;
    case Source.TERMINALX:
      return `${S3_URL}/terminalx.png`;
    case Source.FACTORY54:
      return `${S3_URL}/factory-54.png`;
    case Source.ITAYBRANDS:
      return `${S3_URL}/itaybrands.png`;
    case Source.ZARA:
      return `${S3_URL}/zara.png`;
    case Source.STORY:
      return `${S3_URL}/story.webp`;
    case Source.ONEPROJECTSHOP:
      return `${S3_URL}/oneprojectshop.avif`;
    case Source.CHOZEN:
      return `${S3_URL}/Chozen.avif`;
    case Source.NIKE:
      return `${S3_URL}/nike.png`;
    case Source.JDSPORTS:
      return `${S3_URL}/jd.svg`;
    case Source.GANT:
      return `${S3_URL}/gant.png`;
    case Source.RENUAR:
      return `${S3_URL}/renuar.png`;
    case Source.CASTRO:
      return `${S3_URL}/castro.webp`;
    case Source.STOCKX:
      return `${S3_URL}/stockx.avif`;
    case Source.TOMMY_HILFIGER:
      return `${S3_URL}/tommy.svg`;
    case Source.ALO_YOGA:
      return `${S3_URL}/alo.png`;
    case Source.POLO_RALPH_LAUREN:
      return `${S3_URL}/ralph-lauren.png`;
    case Source.STYLEFORRENT:
      return `${S3_URL}/style-for-rent.webp`;
    // Add more sources here as needed
    default:
      return undefined;
  }
} 