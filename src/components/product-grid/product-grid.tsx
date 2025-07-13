import React from 'react';
import { observer } from 'mobx-react-lite';
import ProductCard, { ProductCardProps } from '../product-card/product-card';
import styles from './product-grid.module.css';

export interface ProductGridProps {
  products: ProductCardProps[];
  priceHistoryMap: Record<number, { price: number; date: string }[]>;
}

const ProductGrid = observer(({ products, priceHistoryMap }: ProductGridProps) => {
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