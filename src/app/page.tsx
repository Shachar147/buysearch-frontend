'use client';
import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import productStore from '../stores/product-store';
import filtersStore from '../stores/filters-store';
import ProductGrid from '../components/product-grid/product-grid';
import FilterBar from '../components/filter-bar/filter-bar';
import styles from './page.module.css';
import getClasses from '../utils/get-classes';

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
      <header className={styles.header}>
        <span className={styles.headerLogo}>BUYSEARCH</span>
        <span className={styles.headerDivider}>|</span>
        <div className={styles.genderSwitch}>
          <span
            className={getClasses([
              styles.genderOption,
              filtersStore.selected.gender === 'men' && styles.genderOptionActive,
            ])}
            onClick={() => filtersStore.setGender('men')}
          >
            Men
          </span>
          <span className={styles.headerDivider}>|</span>
          <span
            className={getClasses([
              styles.genderOption,
              filtersStore.selected.gender === 'women' && styles.genderOptionActive,
            ])}
            onClick={() => filtersStore.setGender('women')}
          >
            Women
          </span>
        </div>
        <div className={styles.headerSearch}>
          <input
            className={styles.headerSearchInput}
            type="text"
            placeholder="Search for items and brands"
            aria-label="Search"
            value={filtersStore.selected.search}
            onChange={e => filtersStore.setFilter('search', e.target.value)}
          />
        </div>
      </header>
      <main className={styles.main}>
        {/* <h2 className={styles.title}>Men's Products</h2> */}
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