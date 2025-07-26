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
    case 'asos':
      return `${S3_URL}/asos.png`;
    case 'terminalx':
      return `${S3_URL}/terminalx.png`;
    case 'factory54':
      return `${S3_URL}/factory54.png`;
    case 'itaybrands':
      return `${S3_URL}/itaybrands.png`;
    case 'zara':
      return `${S3_URL}/zara.png`;
    case 'story':
      return `${S3_URL}/story.webp`;
    case 'oneprojectshop':
      return `${S3_URL}/oneprojectshop.avif`;
    case 'chozen':
      return `${S3_URL}/Chozen.avif`
    case 'nike':
      return `${S3_URL}/nike.png`
    case 'jdsports':
      return `${S3_URL}/jd.svg`
    case 'gant':
      return `${S3_URL}/gant.png`;
    case 'renuar':
      return `${S3_URL}/renuar.png`;
    case 'castro':
      return `${S3_URL}/castro.webp`;
    case 'stockx':
      return `${S3_URL}/stockx.avif`;
    case 'tommy hilfiger':
      return `${S3_URL}/tommy.svg`;
    case 'alo yoga':
      return `${S3_URL}/alo.png`;
    case 'polo ralph lauren':
      return `${S3_URL}/ralph-lauren.png`;
    case 'styleforrent':
      return `${S3_URL}/style-for-rent.webp`;
    case 'revolve':
      return `${S3_URL}/revolve.png`;
    case 'primark':
      return `${S3_URL}/primark.png`;
    case 'adidas':
      return `${S3_URL}/adidas-2.png`;
    case 'lululemon':
      return `${S3_URL}/lululemon.png`;
    case 'golf & co':
      return `${S3_URL}/golf-co.png`;
    case 'bananhot':
      return `${S3_URL}/bananhot.png`;
    case 'foxhome':
      return `${S3_URL}/fox-home-2.png`;
    case 'zarahome':
      return `${S3_URL}/zara-home.png`;
    case 'legaloutfit':
      return `${S3_URL}/legaloutfit.png`;
    case 'new balance':
      return `${S3_URL}/new-balance.png`;
    case 'foot locker':
      return `${S3_URL}/footlocker.png`;
    case 'new era':
      return `${S3_URL}/new-era.png`;
    case 'razili':
      return `${S3_URL}/razili.avif`;
    case 'hamashbir':
      return `${S3_URL}/mashbir.avif`;
    // Add more sources here as needed
    default:
      return undefined;
  }
} 