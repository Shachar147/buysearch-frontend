import React from 'react';
import { observer } from 'mobx-react-lite';
import ProductCard, { ProductCardProps } from '../product-card/product-card';
import styles from './product-grid.module.css';
import favouritesStore from '../../stores/favourites-store';

export interface ProductGridProps {
  products: ProductCardProps[];
}

const ProductGrid = observer(({ products }: ProductGridProps) => {
  return (
    <div className={styles.grid}>
      {products.map((product, idx) => (
        <ProductCard
          key={product.productId}
          {...product}
          productId={product.productId}
          isFavourite={favouritesStore.isFavourite(product.productId)}
        />
      ))}
    </div>
  );
});

export default ProductGrid; 