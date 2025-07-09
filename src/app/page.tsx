'use client';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import productStore from '../stores/product-store';
import ProductGrid from '../components/product-grid/product-grid';
import FilterBar from '../components/filter-bar/filter-bar';
import styles from './page.module.css';
import Header from '../components/header/header';
import getClasses from '../utils/get-classes';
import ScrollUpButton from '../components/scroll-up-button';
import filtersStore, { filtersToQueryString, queryStringToFilters } from '../stores/filters-store';
import { toJS, reaction } from 'mobx';

function HomePage() {
  const [showScrollUp, setShowScrollUp] = useState(false);

  // On mount, read filters from hash if present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#?')) {
      try {
        const hash = window.location.hash.slice(2);
        const parsed = queryStringToFilters(hash);
        Object.assign(filtersStore.selected, parsed);
        // Ensure isFavourite and gender are set as expected
        if (typeof parsed.isFavourite !== 'undefined') {
          if (Array.isArray(parsed.isFavourite)) {
            filtersStore.selected.isFavourite = parsed.isFavourite.includes('true');
          } else {
            filtersStore.selected.isFavourite = parsed.isFavourite === 'true' || parsed.isFavourite === true;
          }
        }
        if (typeof parsed.gender === 'string') {
          filtersStore.selected.gender = parsed.gender;
        } else if (Array.isArray(parsed.gender) && typeof parsed.gender[0] === 'string') {
          filtersStore.selected.gender = parsed.gender[0];
        }
      } catch (e) { /* ignore */ }
    }
  }, []);

  // When filters change, update the hash
  useEffect(() => {
    const disposer = reaction(
      () => toJS(filtersStore.selected),
      (selected) => {
        if (typeof window !== 'undefined') {
          const query = filtersToQueryString(selected);
          window.location.hash = query ? '?' + query : '';
        }
      }
    );
    return () => disposer();
  }, []);

  // Handler for toggling favourites (heart icon)
  const handleToggleFavourites = (val: boolean) => {
    filtersStore.selected.isFavourite = val;
    filtersStore.debouncedFilterChange();
    // Update hash immediately
    if (typeof window !== 'undefined') {
      const query = filtersToQueryString(filtersStore.selected);
      window.location.hash = query ? '?' + query : '';
    }
  };

  // Handler for gender switch
  const handleGenderSwitch = (gender: string) => {
    filtersStore.setGender(gender);
    // Update hash immediately
    if (typeof window !== 'undefined') {
      const query = filtersToQueryString(filtersStore.selected);
      window.location.hash = query ? '?' + query : '';
    }
  };

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
      <Header
        showFavouritesOnly={filtersStore.selected.isFavourite}
        onToggleFavourites={handleToggleFavourites}
      />
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
            source: p.source?.name,
            updatedAt: p.updatedAt,
            createdAt: p.createdAt,
            productId: p.id
          }))}
        />
        {!productStore.loading && (!productStore.products || productStore.products.length === 0) && 
            (
              <div className={getClasses([styles.empty, 'text-headline-6', 'color-gray-7'])}>No items found.</div>
            )
        }
        {(total > 0) && <div className={styles.loadMoreWrapper}>
          <div className={getClasses([styles.productCount, 'text-headline-6', 'color-black-4'])}>
            {`You've viewed ${viewed} of ${total} products`}
          </div>
          {productStore.hasNextPage && (
            <button
              className={getClasses([styles.loadMoreBtn, 'text-headline-6', 'color-black-6'])}
              onClick={() => productStore.loadMore()}
            >
              LOAD MORE
            </button>
          )}
        </div>}
        {productStore.loading && <div className={styles.message}>Loading...</div>}
        {total > 0 && !productStore.hasNextPage && <div className={styles.message}>No more products.</div>}
        {showScrollUp && (
          <ScrollUpButton show={showScrollUp} />
        )}
      </main>
    </div>
  );
}

export default observer(HomePage); 