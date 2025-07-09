'use client';
import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import productStore from '../stores/product-store';
import ProductGrid from '../components/product-grid/product-grid';
import FilterBar from '../components/filter-bar/filter-bar';
import styles from './page.module.css';
import Header from '../components/header/header';

function HomePage() {
  const [showScrollUp, setShowScrollUp] = useState(false);

  useEffect(() => {
    productStore.loadMore();
  }, []);

  useEffect(() => {
    function onScroll() {
      setShowScrollUp(productStore.offset > productStore.limit);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const viewed = productStore.products.length;
  const total = productStore.total;

  return (
    <div className={styles.root}>
      <Header />
      <main className={styles.main}>
        <FilterBar />
        <ProductGrid
          products={productStore.products.map((p) => ({
            image: p.images[0] || '',
            title: p.title,
            brand: p.brand?.name || '',
            price: p.price,
            oldPrice: p.oldPrice,
            currency: p.currency,
            colors: p.colors.map((c) => c.name),
            url: p.url,
            images: p.images,
            source: p.source?.name
          }))}
        />
        {!productStore.loading && (!productStore.products || productStore.products.length === 0) && 
            (
                <div className={styles.empty}>No items found.</div>
            )
        }
        {total > 0 && <div className={styles.loadMoreWrapper}>
          <div className={styles.productCount}>
            {`You've viewed ${viewed} of ${total} products`}
          </div>
          {productStore.hasNextPage && (
            <button
              className={styles.loadMoreBtn}
              onClick={() => productStore.loadMore()}
            >
              LOAD MORE
            </button>
          )}
        </div>}
        {productStore.loading && <div className={styles.message}>Loading...</div>}
        {total > 0 && !productStore.hasNextPage && <div className={styles.message}>No more products.</div>}
        {showScrollUp && (
          <button
            className={styles.scrollUpBtn}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
          >
            ↑
          </button>
        )}
      </main>
    </div>
  );
}

export default observer(HomePage); 