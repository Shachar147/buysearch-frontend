'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import ProductGrid from '../components/product-grid/product-grid';
import FilterBar from '../components/filter-bar/filter-bar';
import SavedFilters from '../components/saved-filters/saved-filters';
import styles from './page.module.css';
import Header from '../components/header/header';
import getClasses from '../utils/get-classes';
import ScrollUpButton from '../components/scroll-up-button';
import filtersStore, { filtersToQueryString, queryStringToFilters } from '../stores/filters-store';
import { toJS, reaction } from 'mobx';
import { useInfiniteProducts } from '../api/product/queries';
import { fetchBulkPriceHistory, ProductFilters } from '../services/product-api-service';
import { Loader } from '../components/loader/loader';
import SourceSlider from '../components/source-slider';
import Search from '../components/search/search';

function HomePage() {
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showPriceChangeOnly, setShowPriceChangeOnly] = useState(false);
  const [localSearch, setLocalSearch] = useState(filtersStore.selected.search);

  useEffect(() => {
    setLocalSearch(filtersStore.selected.search);
  }, [filtersStore.selected.search]);


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
  } = useInfiniteProducts(selectedFilters as ProductFilters, limit);

  // @ts-ignore
  const allProducts = data?.pages.flatMap((page) => page.data) ?? [];
  // @ts-ignore
  const total = data?.pages[0]?.total ?? 0;
  const [priceHistoryMap, setPriceHistoryMap] = useState<Record<number, { price: number; date: string }[]>>({});
  const [lastProductIds, setLastProductIds] = useState<number[]>([]);

  useEffect(() => {
    const productIds = allProducts.map((p) => p.id).filter(Boolean);

    // Only fetch if productIds have changed
    if (
      productIds.length === 0 ||
      (lastProductIds.length === productIds.length &&
        lastProductIds.every((id, idx) => id === productIds[idx]))
    ) {
      return;
    }

    setLastProductIds(productIds);

    fetchBulkPriceHistory(productIds, 5)
      .then((result) => {
        setPriceHistoryMap(result);
      })
      .catch(() => {
        setPriceHistoryMap({});
      });
  }, [allProducts, lastProductIds]);

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

  const genderTabs = [
    { label: 'Women', value: 'women' },
    { label: 'Men', value: 'men' },
    { label: 'Unisex', value: 'unisex' },
  ];

  return (
    <div className={styles.root}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <Header />
      </div>
      {/* Banner with tabs at the bottom */}
      <div style={{
        width: '100%',
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 0,
        background: 'url(https://buysearch.s3.eu-north-1.amazonaws.com/bg-3.jpeg) center/cover',
      }}>
        {/* Overlay for better text contrast */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 1,
        }} />
        <Search value={localSearch} onChange={setLocalSearch} />
        {/* Tabs at the bottom of the banner */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: 400,
            margin: '0 auto',
            position: 'absolute',
            bottom: -1,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            background: 'rgba(255,255,255,0.05)',
            // borderRadius: 16,
            overflow: 'hidden',
            // boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          {genderTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => handleGenderSwitch(tab.value)}
              style={{
                flex: 1,
                minWidth: 0,
                background: filtersStore.selected.gender === tab.value ? '#f7f7f7' : 'transparent',
                color: filtersStore.selected.gender === tab.value ? '#222' : '#fff',
                border: 'none',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                padding: '16px 0',
                fontWeight: filtersStore.selected.gender === tab.value ? 700 : 400,
                fontSize: 20,
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {/* <Header
        showFavouritesOnly={filtersStore.selected.isFavourite}
        onToggleFavourites={handleToggleFavourites}
        showPriceChangeOnly={showPriceChangeOnly}
        onTogglePriceChange={handleTogglePriceChange}
      /> */}
      <main className={styles.main} style={{ marginTop: 24 }}>
        <SavedFilters />
        <FilterBar />
        {total > 0 && <div className={styles.totalResultsWrapper}>
          <div className={getClasses([styles.productCount, 'text-headline-6', 'color-black-4'])}>
            {`Total results: ${total.toLocaleString()}`}
          </div>
        </div>}
        <ProductGrid
          products={allProducts.map((p) => ({
            id: p.id,
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
            productId: p.id,
            categories: p.categories ? p.categories.map((c) => c.name) : [],
          }))}
          priceHistoryMap={priceHistoryMap}
        />
        {!isLoading && (!allProducts || allProducts.length === 0) && 
            (
              <div className={getClasses([styles.empty, 'text-headline-6', 'color-gray-7', 'flex-column', 'gap-8'])}>
                No items found.
                {filtersStore.selected.search && (
                  <span>
                  Try{' '}
                  <span
                    style={{ color: '#e91e63', textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={() => filtersStore.setFilter('search', '')}
                  >
                    clearing the search box
                  </span>
                </span>
                )}
              </div>
            )
        }
        {(total > 0) && <div className={styles.loadMoreWrapper}>
          <div className={getClasses([styles.productCount, 'text-headline-6', 'color-black-4'])}>
            {/* {`You've viewed ${viewed.toLocaleString()} of ${total.toLocaleString()} products`} */}
            {`Viewing ${viewed.toLocaleString()} of ${total.toLocaleString()}`}
          </div>
          {hasNextPage && (
            <button
              className={getClasses([styles.loadMoreBtn, 'text-headline-6', 'color-black-6'])}
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {/* {isFetchingNextPage ? 'Loading...' : 'LOAD MORE'} */}
              {isFetchingNextPage ? 'LOADING...' : 'VIEW MORE PRODUCTS'}
            </button>
          )}
        </div>}
        {isLoading && <Loader/>}
        {total > 0 && !hasNextPage && <div className={styles.message}>No more products.</div>}
        {showScrollUp && (
          <ScrollUpButton show={showScrollUp} />
        )}
      </main>
      {/* Source slider at the bottom */}
      <SourceSlider />
    </div>
  );
}

export default observer(HomePage); 