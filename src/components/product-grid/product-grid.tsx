import React from 'react';
import ProductCard, { ProductCardProps } from '../product-card/product-card';
import styles from './product-grid.module.css';

export interface ProductGridProps {
  products: ProductCardProps[];
}

function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return <div className={styles.empty}>No items found.</div>;
  }
  return (
    <div className={styles.grid}>
      {products.map((product, idx) => (
        <ProductCard key={idx} {...product} />
      ))}
    </div>
  );
}

export default ProductGrid; 