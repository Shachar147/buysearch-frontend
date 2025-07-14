import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './product-card.module.css';
import getClasses from '../../utils/get-classes';
import getSourceLogo from '../../utils/source-logo';
import { getTimeAgo, formatDateTime } from '../../utils/utils';
import { useFavourites } from '../../api/favourites/queries';
import { useAddToFavourite, useRemoveFromFavourite } from '../../api/favourites/mutations';
import ProductPriceTrend from '../product-price-trend';

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
  productId: number;
  isFavourite?: boolean;
  priceHistory?: { price: number; date: string }[];
}

const DEFAULT_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

const ProductCard = observer(({
  image, title, brand, price, oldPrice, currency, colors, url, images = [], source, isSellingFast = false, hasMoreColours = false, updatedAt, createdAt, productId, isFavourite, priceHistory: externalPriceHistory
}: ProductCardProps) => {
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

  const { data: favourites, refetch: refetchFavourites } = useFavourites();
  const addToFavouriteMutation = useAddToFavourite();
  const removeFromFavouriteMutation = useRemoveFromFavourite();

  const fav = favourites ? favourites.some((f: any) => f.productId === productId || f === productId) : false;

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fav) {
      await removeFromFavouriteMutation.mutateAsync(productId);
      refetchFavourites();
    } else {
      await addToFavouriteMutation.mutateAsync(productId);
      refetchFavourites();
    }
  };

  // Use priceHistory prop only (from productStore)
  const priceHistory = (externalPriceHistory && externalPriceHistory.length > 0)
    ? externalPriceHistory
    : [{ price: price ?? 0, date: createdAt?.toString() || new Date().toISOString() }];

  // Determine price trend
  let trend: 'up' | 'down' | 'none' = 'none';
  if (priceHistory.length >= 2) {
    if (priceHistory[priceHistory.length - 1].price > priceHistory[priceHistory.length - 2].price) trend = 'up';
    else if (priceHistory[priceHistory.length - 1].price < priceHistory[priceHistory.length - 2].price) trend = 'down';
  }

  // Render sparkline SVG
  const renderSparkline = () => {
    if (priceHistory.length < 2) return null;
    const max = Math.max(...priceHistory.map(h => h.price));
    const min = Math.min(...priceHistory.map(h => h.price));
    const w = 48, h = 18;
    const points = priceHistory.map((p, i) => {
      const x = (w / (priceHistory.length - 1)) * i;
      const y = h - ((p.price - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg width={w} height={h} style={{ marginLeft: 4, verticalAlign: 'middle' }}>
        <polyline
          fill="none"
          stroke="#d72660"
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

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
      <span
        className={getClasses([
          styles.heart,
          fav && styles.heartFilled
        ])}
        title={fav ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={handleHeartClick}
        aria-pressed={fav}
        role="button"
        tabIndex={0}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={fav ? 'var(--bs-red-5)' : 'none'} stroke={fav ? 'var(--bs-red-5)' : '#222'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.8 4.6c-1.5-1.4-3.9-1.4-5.4 0l-.7.7-.7-.7c-1.5-1.4-3.9-1.4-5.4 0-1.6 1.5-1.6 3.9 0 5.4l6.1 6.1c.2.2.5.2.7 0l6.1-6.1c1.6-1.5 1.6-3.9 0-5.4z"/>
        </svg>
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
          {oldPrice && Number(oldPrice) > Number(price ?? 0) ? (
            <>
              <span className={getClasses([styles.oldPrice, 'text-body', 'color-gray-5'])}>{oldPrice} {currency}</span>
              <span className={getClasses([styles.salePrice, 'text-body', 'color-red-5'])}>{price} {currency}</span>
            </>
          ) : (
            <span>{price !== null ? `${price} ${currency}` : 'N/A'}</span>
          )}
          {/* Price trend sparkline and tooltip */}
          <ProductPriceTrend history={priceHistory} />
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
});

export default ProductCard; 