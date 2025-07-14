'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import ProductGrid from '../components/product-grid/product-grid';
import FilterBar from '../components/filter-bar/filter-bar';
import styles from './page.module.css';
import Header from '../components/header/header';
import getClasses from '../utils/get-classes';
import ScrollUpButton from '../components/scroll-up-button';
import filtersStore, { filtersToQueryString, queryStringToFilters } from '../stores/filters-store';
import { toJS, reaction } from 'mobx';
import { useInfiniteProducts } from '../api/product/queries';

function HomePage() {
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showPriceChangeOnly, setShowPriceChangeOnly] = useState(false);
  // Memoize selectedFilters to prevent infinite loops
  const selectedFilters = useMemo(() => ({
    ...filtersStore.selected,
    brand: Array.isArray(filtersStore.selected.brand) ? filtersStore.selected.brand.join(',') : (filtersStore.selected.brand || ''),
    category: Array.isArray(filtersStore.selected.category) ? filtersStore.selected.category.join(',') : (filtersStore.selected.category || ''),
    color: Array.isArray(filtersStore.selected.color) ? filtersStore.selected.color.join(',') : (filtersStore.selected.color || ''),
  }), [
    filtersStore.selected.brand,
    filtersStore.selected.category,
    filtersStore.selected.color,
    filtersStore.selected.search,
    filtersStore.selected.sort,
    filtersStore.selected.priceRange,
    filtersStore.selected.gender,
    filtersStore.selected.isFavourite,
    filtersStore.selected.withPriceChange,
    filtersStore.selected.source,
    filtersStore.selected.isOnSale
  ]);
  const limit = 20;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteProducts(selectedFilters, limit);

  const allProducts = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const priceHistoryMap = {};

  // On mount, read filters from hash if present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#?')) {
      try {
        const hash = window.location.hash.slice(2);
        const parsed = queryStringToFilters(hash);
        Object.assign(filtersStore.selected, parsed);
        // Ensure isFavourite and gender are set as expected
        if (typeof parsed.isFavourite !== 'undefined') {
          const favVal = Array.isArray(parsed.isFavourite) ? parsed.isFavourite[0] : parsed.isFavourite;
          filtersStore.selected.isFavourite = favVal === 'true';
        }
        if (typeof parsed.gender === 'string') {
          filtersStore.selected.gender = parsed.gender;
        } else if (Array.isArray(parsed.gender) && typeof parsed.gender[0] === 'string') {
          filtersStore.selected.gender = parsed.gender[0];
        }
        // Read price change filter from hash
        if (typeof parsed.withPriceChange !== 'undefined') {
          const val = Array.isArray(parsed.withPriceChange) ? parsed.withPriceChange[0] : parsed.withPriceChange;
          setShowPriceChangeOnly(val === 'true');
          filtersStore.selected.withPriceChange = val === 'true';
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
          const query = filtersToQueryString({ ...selected, withPriceChange: showPriceChangeOnly });
          window.location.hash = query ? '?' + query : '';
        }
      }
    );
    return () => disposer();
  }, [showPriceChangeOnly]);

  // Handler for toggling favourites (heart icon)
  const handleToggleFavourites = (val: boolean) => {
    filtersStore.selected.isFavourite = val;
    // Update hash immediately
    if (typeof window !== 'undefined') {
      const query = filtersToQueryString({ ...filtersStore.selected, withPriceChange: showPriceChangeOnly });
      window.location.hash = query ? '?' + query : '';
    }
  };

  // Handler for toggling price change filter (trend icon)
  const handleTogglePriceChange = (val: boolean) => {
    setShowPriceChangeOnly(val);
    filtersStore.selected.withPriceChange = val;
    // Update hash immediately
    if (typeof window !== 'undefined') {
      const query = filtersToQueryString({ ...filtersStore.selected, withPriceChange: val });
      window.location.hash = query ? '?' + query : '';
    }
  };

  // Handler for gender switch
  const handleGenderSwitch = (gender: string) => {
    filtersStore.setGender(gender);
    // Update hash immediately
    if (typeof window !== 'undefined') {
      const query = filtersToQueryString({ ...filtersStore.selected, withPriceChange: showPriceChangeOnly });
      window.location.hash = query ? '?' + query : '';
    }
  };

  useEffect(() => {
    function onScroll() {
      setShowScrollUp(window.scrollY > 1000);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const viewed = allProducts.length;

  return (
    <div className={styles.root}>
      <Header
        showFavouritesOnly={filtersStore.selected.isFavourite}
        onToggleFavourites={handleToggleFavourites}
        showPriceChangeOnly={showPriceChangeOnly}
        onTogglePriceChange={handleTogglePriceChange}
      />
      <main className={styles.main}>
        <FilterBar />
        <ProductGrid
          products={allProducts.map((p) => ({
            image: p.images && p.images[0] ? p.images[0] : '',
            title: p.title,
            brand: p.brand?.name || '',
            price: p.price,
            oldPrice: p.oldPrice,
            currency: p.currency,
            colors: p.colors ? p.colors.map((c) => c.name) : [],
            url: p.url,
            images: p.images || [],
            source: p.source?.name,
            updatedAt: p.updatedAt,
            createdAt: p.createdAt,
            productId: p.id
          }))}
          priceHistoryMap={priceHistoryMap}
        />
        {!isLoading && (!allProducts || allProducts.length === 0) && 
            (
              <div className={getClasses([styles.empty, 'text-headline-6', 'color-gray-7'])}>No items found.</div>
            )
        }
        {(total > 0) && <div className={styles.loadMoreWrapper}>
          <div className={getClasses([styles.productCount, 'text-headline-6', 'color-black-4'])}>
            {`You've viewed ${viewed} of ${total} products`}
          </div>
          {hasNextPage && (
            <button
              className={getClasses([styles.loadMoreBtn, 'text-headline-6', 'color-black-6'])}
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'LOAD MORE'}
            </button>
          )}
        </div>}
        {isLoading && <div className={styles.message}>Loading...</div>}
        {total > 0 && !hasNextPage && <div className={styles.message}>No more products.</div>}
        {showScrollUp && (
          <ScrollUpButton show={showScrollUp} />
        )}
      </main>
    </div>
  );
}

export default observer(HomePage); 