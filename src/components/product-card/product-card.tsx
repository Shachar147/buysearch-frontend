import React from 'react';
import styles from './product-card.module.css';
import getClasses from '../../utils/get-classes';
import getSourceLogo from '../../utils/source-logo';

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
}

function ProductCard({ image, title, brand, price, oldPrice, currency, colors, url, images = [], source, isSellingFast = false, hasMoreColours = false }: ProductCardProps) {
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
            <img src={firstImage} alt={title} className={getClasses([styles.image, 'border-radius-8'])} />
          </div>
          <div className={styles.back}>
            <img src={secondImage} alt={title + ' alt'} className={getClasses([styles.image, 'border-radius-8'])} />
          </div>
        </div>
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.brand}>{brand}</div>
      <div className={styles.priceRow}>
        {discountPercent !== null && (
          <span className={styles.discountPercent}>-{discountPercent}%</span>
        )}
        <div className={styles.price}>
          {oldPrice && oldPrice > (price ?? 0) ? (
            <>
              <span className={styles.oldPrice}>{oldPrice} {currency}</span>
              <span className={styles.salePrice}>{price} {currency}</span>
            </>
          ) : (
            <span>{price !== null ? `${price} ${currency}` : 'N/A'}</span>
          )}
        </div>
      </div>
      <div className={styles.colors}>
        {colors.length > 0 ? `Colors: ${colors.join(', ')}` : ''}
      </div>
      <div className={styles.badges}>
        {hasMoreColours && <span className={getClasses([styles.badge, styles.badgeAlt])}>More Colours</span>}
        {isSellingFast && <span className={styles.badge}>Selling Fast</span>}
      </div>
    </div>
  );
}

export default ProductCard; 