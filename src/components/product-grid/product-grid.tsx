import React from 'react';
import { observer } from 'mobx-react-lite';
import ProductCard, { ProductCardProps } from '../product-card/product-card';
import styles from './product-grid.module.css';
import productStore from '../../stores/product-store';

export interface ProductGridProps {
  products: ProductCardProps[];
}

const ProductGrid = observer(({ products }: ProductGridProps) => {
  // Use priceHistoryMap from productStore
  const priceHistoryMap = productStore.priceHistoryMap;
  return (
    <div className={styles.grid}>
      {products.map((p) => (
        <ProductCard
          key={p.productId}
          {...p}
          priceHistory={priceHistoryMap[p.productId]}
        />
      ))}
    </div>
  );
});

export default ProductGrid; 