// ProductPriceTrend: Tooltip for price history, sparkline inside tooltip, history emoji trigger
import React, { useState, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './product-price-trend.module.css';
import getClasses from '../utils/get-classes';

export interface PriceHistoryPoint {
  price: number;
  date: string;
}

const ProductPriceTrend: React.FC<{ history: PriceHistoryPoint[] }> = ({ history }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, insetInlineStart: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);

  if (!history || history.length < 1) return null;
  const max = Math.max(...history.map(h => h.price));
  const min = Math.min(...history.map(h => h.price));
  const w = 40, h = 14;
  const points = history.map((p, i) => {
    const x = (w / (history.length - 1)) * i;
    const y = h - ((p.price - min) / (max - min || 1)) * h;
    return { x, y, ...p };
  });

  useLayoutEffect(() => {
    if (showTooltip && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPos({ top: rect.bottom + window.scrollY + 6, insetInlineStart: rect.left + window.scrollX });
    }
  }, [showTooltip]);

  // Only show the history icon if there are price changes
  if (history.length <= 1) return null;

  return (
    <span className={styles.trendWrapper}>
      <span
        ref={iconRef}
        className={getClasses(['text-body', 'color-gray-7'])}
        style={{ cursor: 'pointer', fontSize: '16px', marginInlineStart: 6 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        🕓
      </span>
      {showTooltip && ReactDOM.createPortal(
        <div
          className={getClasses([styles.tooltip, 'text-body', 'color-black-6'])}
          style={{ top: tooltipPos.top, insetInlineStart: tooltipPos.insetInlineStart }}
        >
          <b className={getClasses(['text-body', 'color-black-6'])}>Price History</b>
          {history.length >= 4 && (
            <div className={getClasses([styles.trendCenter])}>
              <svg width={w} height={h} className={styles.sparkline}>
                <polyline
                  fill="none"
                  stroke="var(--bs-gray-6)"
                  strokeWidth="1"
                  points={points.map(p => `${p.x},${p.y}`).join(' ')}
                />
              </svg>
            </div>
          )}
          <ul className={styles.tooltipList}>
            {history.map((h, i) => (
              <li key={i}>
                <span className={getClasses(['text-body', 'color-gray-7'])}>{new Date(h.date).toLocaleString()} — <b className={getClasses(['color-black-6'])}>{h.price} ILS</b></span>
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )}
    </span>
  );
};

export default ProductPriceTrend; 