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
}

function ProductCard({ image, title, brand, price, oldPrice, currency, colors, url, images = [], source }: ProductCardProps) {
  const firstImage = images[0] || image;
  const secondImage = images[1] || images[0] || image;
  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  const logoUrl = getSourceLogo(source);
  return (
    <div
      className={styles.card}
      style={{ cursor: url ? 'pointer' : 'default' }}
      onClick={handleClick}
      tabIndex={url ? 0 : -1}
      role={url ? 'link' : undefined}
      aria-label={url ? `Open ${title}` : undefined}
    >
      {/* Source logo (external SVG, fixed size, high z-index) */}
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
      {/* Flip image */}
      <div className={styles['flip-container']}>
        <div className={styles.flipper}>
          <div className={styles.front}>
            <img src={firstImage} alt={title} className={getClasses([styles.image, 'border-radius-6'])} />
          </div>
          <div className={styles.back}>
            <img src={secondImage} alt={title + ' alt'} className={getClasses([styles.image, 'border-radius-6'])} />
          </div>
        </div>
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.brand}>{brand}</div>
      <div className={styles.price}>
        {price !== null ? `${price} ${currency}` : 'N/A'}
        {oldPrice && oldPrice > price ? (
          <span className={styles.oldPrice}>
            {oldPrice} {currency}
          </span>
        ) : null}
      </div>
      <div className={styles.colors}>
        {colors.length > 0 ? `Colors: ${colors.join(', ')}` : ''}
      </div>
    </div>
  );
}

export default ProductCard; 