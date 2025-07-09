import React from 'react';
import styles from './product-card.module.css';
import getClasses from '../../utils/get-classes';
import getSourceLogo from '../../utils/source-logo';
import { getTimeAgo, formatDateTime } from '../../utils/utils';

export interface ProductCardProps {
  image: string;
  title: string;
  brand: string;
  price: number | null;
  oldPrice?: number | null;
  currency: string;
  colors: string[];
  url?: string;
  images?: string[];
  source?: string;
  isSellingFast?: boolean;
  hasMoreColours?: boolean;
  updatedAt?: string | Date;
  createdAt?: string | Date;
}

const DEFAULT_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

function ProductCard({ image, title, brand, price, oldPrice, currency, colors, url, images = [], source, isSellingFast = false, hasMoreColours = false, updatedAt, createdAt }: ProductCardProps) {
  const firstImage = images[0] || image;
  const secondImage = images[1] || images[0] || image;
  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  const logoUrl = getSourceLogo(source);
  let discountPercent: number | null = null;
  if (oldPrice && price && oldPrice > price) {
    discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
  }
  const timeValue = updatedAt || createdAt;
  return (
    <div
      className={styles.card}
      style={{ cursor: url ? 'pointer' : 'default' }}
      onClick={handleClick}
      tabIndex={url ? 0 : -1}
      role={url ? 'link' : undefined}
      aria-label={url ? `Open ${title}` : undefined}
    >
      {/* Source logo */}
      {logoUrl && (
        <img
          className={styles.logo}
          src={logoUrl}
          alt={source + ' logo'}
          width={56}
          height={24}
          style={{ zIndex: 10 }}
        />
      )}
      {/* Heart icon */}
      <span className={styles.heart} title="Add to wishlist">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6c-1.5-1.4-3.9-1.4-5.4 0l-.7.7-.7-.7c-1.5-1.4-3.9-1.4-5.4 0-1.6 1.5-1.6 3.9 0 5.4l6.1 6.1c.2.2.5.2.7 0l6.1-6.1c1.6-1.5 1.6-3.9 0-5.4z"/></svg>
      </span>
      {/* Flip image */}
      <div className={styles['flip-container']}>
        <div className={styles.flipper}>
          <div className={styles.front}>
            <img src={firstImage || DEFAULT_IMAGE_URL} alt={title} className={getClasses([styles.image, 'border-radius-8'])} />
          </div>
          <div className={styles.back}>
            <img src={secondImage || DEFAULT_IMAGE_URL} alt={title + ' alt'} className={getClasses([styles.image, 'border-radius-8'])} />
          </div>
        </div>
      </div>
      <div className={getClasses([styles.title, 'text-headline-4', 'color-black-6'])}>{title}</div>
      <div className={getClasses([styles.brand, 'text-body', 'color-gray-6'])}>{brand}</div>
      <div className={styles.priceRow}>
        {discountPercent !== null && (
          <span className={getClasses([styles.discountPercent, 'text-body', 'color-red-5'])}>-{discountPercent}%</span>
        )}
        <div className={getClasses([styles.price, 'text-body', 'color-black-6'])}>
          {oldPrice && oldPrice > (price ?? 0) ? (
            <>
              <span className={getClasses([styles.oldPrice, 'text-body', 'color-gray-5'])}>{oldPrice} {currency}</span>
              <span className={getClasses([styles.salePrice, 'text-body', 'color-red-5'])}>{price} {currency}</span>
            </>
          ) : (
            <span>{price !== null ? `${price} ${currency}` : 'N/A'}</span>
          )}
        </div>
      </div>
      <div className={getClasses([styles.colors, 'text-body', 'color-black-4'])}>
        {colors.length > 0 ? `Colors: ${colors.join(', ')}` : ''}
      </div>
      <div className={styles.badges}>
        {hasMoreColours && <span className={getClasses([styles.badge, styles.badgeAlt, 'text-body', 'color-black-6'])}>More Colours</span>}
        {isSellingFast && <span className={getClasses([styles.badge, 'text-body', 'color-white'])}>Selling Fast</span>}
      </div>
      {timeValue && (
        <div
          className={getClasses(['text-caption', 'color-gray-5'])}
          style={{ position: 'absolute', bottom: 8, right: 12, cursor: 'help' }}
          title={formatDateTime(timeValue)}
        >
          {`Updated ${getTimeAgo(timeValue)}`}
        </div>
      )}
    </div>
  );
}

export default ProductCard; 