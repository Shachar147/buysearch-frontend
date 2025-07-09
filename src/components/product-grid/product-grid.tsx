import React from 'react';
import ProductCard, { ProductCardProps } from '../product-card/product-card';
import styles from './product-grid.module.css';

export interface ProductGridProps {
  products: ProductCardProps[];
}

function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className={styles.grid}>
      {products.map((product, idx) => (
        <ProductCard key={idx} {...product} />
      ))}
    </div>
  );
}

export default ProductGrid; 