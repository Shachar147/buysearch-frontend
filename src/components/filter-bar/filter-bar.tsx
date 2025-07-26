"use client";

import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './filter-bar.module.css';
import getClasses from '../../utils/get-classes';
import CustomSelect from '../custom-select/custom-select';
import filtersStore from '../../stores/filters-store';
import { priceRangeOptions } from '../../stores/filters-store';
import { ucfirst } from '../../utils/utils';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useAllBrands } from '../../api/brand/queries';
import { useAllColors } from '../../api/color/queries';
import { useAllCategories } from '../../api/category/queries';
import { useAllSources } from '../../api/source/queries';
import { FaSlidersH, FaTimes } from 'react-icons/fa';
import { DEFAULT_SORT_BY } from '../../utils/consts';
import SavedFilters from '../saved-filters/saved-filters';

const sortOptions = [
  { label: 'Relevance', value: 'Relevance' },
  { label: 'Price: Low to High', value: 'Price: Low to High' },
  { label: 'Price: High to Low', value: 'Price: High to Low' },
  { label: 'Sale: Highest Percent', value: 'Sale: Highest Percent' },
  { label: 'Created: Newest First', value: 'Created: Newest First' },
  { label: 'Created: Oldest First', value: 'Created: Oldest First' },
  { label: 'Updated: Newest First', value: 'Updated: Newest First' },
  { label: 'Updated: Oldest First', value: 'Updated: Oldest First' },
];

const toOption = (v: any) => {
  if (typeof v === 'string') return { label: v, value: v };
  if (v && typeof v === 'object' && 'name' in v) return { label: v.name, value: v.name };
  return { label: String(v), value: String(v) };
};

// Utility to uppercase only the first character
function ucfirstFirstOnly(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const FilterBar = observer(() => {
  const { selected, setFilter } = filtersStore;
  const { data: brands = [] } = useAllBrands();
  const { data: colors = [] } = useAllColors();
  const { data: sources = [] } = useAllSources();
  const { data: categories = [] } = useAllCategories(selected.gender?.toLowerCase());
  const min = 0;
  const max = 2000;
  const step = 10;
  const from = typeof selected.priceRange === 'object' && 'from' in selected.priceRange && typeof selected.priceRange.from === 'number' ? selected.priceRange.from : min;
  const to = typeof selected.priceRange === 'object' && 'to' in selected.priceRange && typeof selected.priceRange.to === 'number' ? selected.priceRange.to : max;
  const sliderValue: [number, number] = [from, to];
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const sideMenuRef = useRef<HTMLDivElement>(null);

  // Close side menu on click outside
  useEffect(() => {
    if (!sideMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (sideMenuRef.current && !sideMenuRef.current.contains(e.target as Node)) {
        setSideMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sideMenuOpen]);

  // Helper to detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  // Count applied filters (excluding search)
  const appliedFilters = [
    // selected.sort && selected.sort !== DEFAULT_SORT_BY,
    // selected.search && selected.search !== '', // search?
    selected.brand && Array.isArray(selected.brand) ? selected.brand.some(b => b !== 'All') : selected.brand && selected.brand !== 'All',
    selected.category && Array.isArray(selected.category) ? selected.category.some(c => c !== 'All') : selected.category && selected.category !== 'All',
    selected.color && Array.isArray(selected.color) ? selected.color.some(c => c !== 'All') : selected.color && selected.color !== 'All',
    selected.priceRange && typeof selected.priceRange === 'object' && 'value' in selected.priceRange && selected.priceRange.value === 'Custom',
    selected.source && Array.isArray(selected.source) ? selected.source.some(s => s !== 'All') : selected.source && selected.source !== 'All',
    typeof selected.isOnSale === 'string' && selected.isOnSale !== 'All',
  ].filter(Boolean).length;

  // Helper to build filter chips
  const filterChips: { label: string; onClear: () => void; prefix: string }[] = [];

  // Brand
  if (selected.brand && selected.brand !== 'All') {
    if (Array.isArray(selected.brand)) {
      selected.brand.forEach((b: string) => {
        if (b && b !== 'All') filterChips.push({ label: b, onClear: () => Array.isArray(selected.brand) ? setFilter('brand', selected.brand.filter((x: string) => x !== b)) : setFilter('brand', 'All'), prefix: 'brand: ' });
      });
    } else {
      filterChips.push({ label: selected.brand, onClear: () => setFilter('brand', 'All'), prefix: 'brand: ' });
    }
  }
  // Category
  if (selected.category && selected.category !== 'All') {
    if (Array.isArray(selected.category)) {
      selected.category.forEach((c: string) => {
          if (c && c !== 'All') filterChips.push({ label: c, onClear: () => Array.isArray(selected.category) ? setFilter('category', selected.category.filter((x: string) => x !== c)) : setFilter('category', 'All'), prefix: 'category: ' });
      });
    } else {
      filterChips.push({ label: selected.category, onClear: () => setFilter('category', 'All'), prefix: 'category: ' });
    }
  }
  // Color
  if (selected.color && selected.color !== 'All') {
    if (Array.isArray(selected.color)) {
      selected.color.forEach((c: string) => {
        if (c && c !== 'All') filterChips.push({ label: c, onClear: () => Array.isArray(selected.color) ? setFilter('color', selected.color.filter((x: string) => x !== c)) : setFilter('color', 'All'), prefix: 'color: ' });
      });
    } else {
      filterChips.push({ label: selected.color, onClear: () => setFilter('color', 'All'), prefix: 'color: ' });
    }
  }
  // Price Range
  if (selected.priceRange && typeof selected.priceRange === 'object' && 'value' in selected.priceRange && selected.priceRange.value === 'Custom') {
    filterChips.push({ label: `Custom: ${selected.priceRange.from} - ${selected.priceRange.to} ILS`, onClear: () => setFilter('priceRange', 'All'), prefix: 'price: ' });
  }
  // Source
  if (selected.source && selected.source !== 'All') {
    if (Array.isArray(selected.source)) {
      selected.source.forEach((s: string) => {
        if (s && s !== 'All') filterChips.push({ label: s, onClear: () => Array.isArray(selected.source) ? setFilter('source', selected.source.filter((x: string) => x !== s)) : setFilter('source', 'All'), prefix: 'source: ' });
      });
    } else {
      filterChips.push({ label: selected.source, onClear: () => setFilter('source', 'All'), prefix: 'source: ' });
    }
  }
  // Is On Sale
  if (typeof selected.isOnSale === 'string' && selected.isOnSale !== 'All') {
    filterChips.push({ label: selected.isOnSale, onClear: () => setFilter('isOnSale', 'All'), prefix: 'sale: ' });
  }

  // Source options
  const sourceOptions = [{ label: 'All', value: 'All' }, ...sources.map((s: any) => ({ label: s.name, value: s.name }))];
  // Is On Sale options
  const isOnSaleOptions = [
    { label: 'All', value: undefined },
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];

  // Search
  const searchOptions = [
    { label: 'All', value: '' },
    { label: 'Search', value: 'Search' },
  ];
  if (selected.search && selected.search !== '') {
    filterChips.push({ label: selected.search, onClear: () => setFilter('search', ''), prefix: 'Keywords: ' });
  }

  function renderSortSelect(){
    return (
      <div className={getClasses([styles.filterItem, styles.sortSelect])}>
          <label className={getClasses([styles.label, styles.sortByLabel])}>Sort by:</label>
          <CustomSelect
            options={sortOptions}
            selected={[selected.sort || DEFAULT_SORT_BY]}
            onChange={vals => {
              setFilter('sort', vals[0]);
              if (vals[0] === 'Sale: Highest Percent') {
                setFilter('isOnSale', 'Yes');
              }
            }}
            defaultLabel="Updated: Newest First"
          />
        </div>
    );
  }

  function renderBrandsSelect(){
    return (
      <div className={styles.filterItem}>
          <label className={getClasses([styles.label, 'text-caption'])}>Brand</label>
          <CustomSelect
            options={[{ label: 'All', value: 'All' }, ...brands.map(toOption)]}
            selected={Array.isArray(selected.brand) ? selected.brand : [selected.brand]}
            onChange={vals => setFilter('brand', vals)}
            defaultLabel="All"
            multiselect
            itemType="brands"
          />
      </div>
    )
  }

  function renderCategoriesSelect(){
    return (
      <div className={styles.filterItem}>
          <label className={getClasses([styles.label, 'text-caption'])}>Category</label>
          <CustomSelect
            options={[{ label: 'All', value: 'All' }, ...categories.map(toOption)]}
            selected={Array.isArray(selected.category) ? selected.category : [selected.category]}
            onChange={vals => setFilter('category', vals)}
            defaultLabel="All"
            multiselect
            itemType="categories"
          />
        </div>
    );
  }

  function renderColorsSelect(){
    return (
      <div className={styles.filterItem}>
          <label className={getClasses([styles.label, 'text-caption'])}>Color</label>
          <CustomSelect
            options={[{ label: 'All', value: 'All' }, ...colors.map(toOption)].map((o) => ({ value: ucfirst(o.value), label: ucfirst(o.label) }))}
            selected={Array.isArray(selected.color) ? selected.color : [selected.color]}
            onChange={vals => setFilter('color', vals)}
            defaultLabel="All"
            multiselect
            itemType="colors"
          />
        </div>
    );
  }

  function renderPriceSelect(){
    return (
      <div className={styles.filterItem}>
          <label className={getClasses([styles.label, 'text-caption'])}>Price Range</label>
          <CustomSelect
            options={priceRangeOptions.map(opt => typeof opt === 'object' ? {
              ...opt,
              label: opt.label === 'Custom' && typeof selected.priceRange === 'object' && 'from' in selected.priceRange && 'to' in selected.priceRange && typeof selected.priceRange.from === 'number' && typeof selected.priceRange.to === 'number'
                ? `Custom: ${selected.priceRange.from} - ${selected.priceRange.to} ILS`
                : opt.label
            } : { label: String(opt), value: String(opt) })}
            selected={selected.priceRange && typeof selected.priceRange === 'object' && 'value' in selected.priceRange && selected.priceRange.value ? [String(selected.priceRange.value)] : ['All']}
            onChange={vals => {
              const found = priceRangeOptions.find(opt => (typeof opt === 'object' ? opt.value : opt) === vals[0]) || priceRangeOptions[0];
              setFilter('priceRange', found);
            }}
            defaultLabel="All"
            disableAlphabetSorting
            renderCustomContent={() => (
              <div className={styles.sliderContainer}>
                <Slider
                  range
                  min={min}
                  max={max}
                  step={step}
                  value={sliderValue}
                  onChange={(val) => {
                    // todo: add debounce
                    if (Array.isArray(val) && val.length === 2) {
                      setFilter('priceRange', { label: `Custom: ${val[0]} - ${val[1]} ILS`, from: val[0], to: val[1], value: 'Custom' });
                    }
                  }}
                  allowCross={false}
                  trackStyle={[{ backgroundColor: 'var(--bs-blue-5)', height: 6, paddingInline: '20px' }]} 
                  handleStyle={[
                    { borderColor: 'var(--bs-blue-5)', backgroundColor: 'var(--bs-white)', boxShadow: '0 0 0 2px var(--bs-blue-1)', height: 22, width: 22 },
                    { borderColor: 'var(--bs-blue-5)', backgroundColor: 'var(--bs-white)', boxShadow: '0 0 0 2px var(--bs-blue-1)', height: 22, width: 22 }
                  ]}
                  railStyle={{ backgroundColor: 'var(--bs-gray-2)', height: 6,  width: 'CALC(100% - 20px)' }}
                  className={styles.slider}
                  style={{ paddingInline: '20px' }}
                />
                <div className={styles.sliderValueLabels}>
                  <span>{sliderValue[0]} ILS</span>
                  <span>{sliderValue[1]} ILS</span>
                </div>
              </div>
            )}
          />
        </div>
    );
  }

  function renderSourceSelect(){
    return (
      <div className={styles.filterItem}>
          <label className={getClasses([styles.label, 'text-caption'])}>Source</label>
          <CustomSelect
            options={sourceOptions.map((o) => ({ ...o, label: ucfirstFirstOnly(o.label)}))}
            selected={Array.isArray(selected.source) ? selected.source : [selected.source]}
            onChange={vals => setFilter('source', vals)}
            defaultLabel="All"
            multiselect
          />
        </div>
    );
  }

  function renderSaleSelect(){
    return (
      <div className={styles.filterItem}>
          <label className={getClasses([styles.label, 'text-caption'])}>Is On Sale</label>
          <CustomSelect
            options={isOnSaleOptions}
            selected={[selected.isOnSale === undefined ? 'All' : String(selected.isOnSale)]}
            onChange={vals => {
              setFilter('isOnSale', vals[0] === 'All' ? undefined : vals[0])
            }}
            defaultLabel="All"
          />
        </div>
    );
  }

  function renderShowFiltersButton(){
    return (
      <button
            className={styles.showFiltersButton}
            onClick={() => setSideMenuOpen(true)}
          >
            <FaSlidersH style={{ marginInlineEnd: isMobile ? 0 : 8 }} />
            {!isMobile && <>Show filters</>}
            {appliedFilters > 0 && <span className={styles.filterBadge}>{appliedFilters}</span>}
          </button>
    )
  }

  function renderFilterChips(){
    if (filterChips.length == 0) return null;

    return (
      <div className={styles.filterChipsWrapper}>
        {filterChips.map((chip, idx) => (
          <span key={chip.label + idx} className={styles.filterChip}>
            {/* <span style={{marginRight: 6, fontWeight: 400, fontSize: 15}}>{chip.prefix}</span> */}
            {ucfirst(chip.prefix)}
            {chip.label}
            <button
              onClick={chip.onClear}
              className={styles.filterChipClose}
              aria-label={`Clear filter ${chip.label}`}
            >
              <FaTimes />
            </button>
          </span>
        ))}
      </div>
    );
  }

  // Render full filter bar for desktop or when mobileFiltersOpen is true
  return (
    <div className={getClasses([styles.filterBar])}>
      <div className={styles.filterBarTopRow}>
        {renderShowFiltersButton()}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isMobile && renderFilterChips()}
        </div>
        <div className={styles.sortByWrapper}>
          {/* Sort by dropdown */}
          {renderSortSelect()}
        </div>
      </div>
      {isMobile && <div className={styles.filterChipsMobile}>{renderFilterChips()}</div>}
      {/* Side menu for filters */}
      {
        <div
          ref={sideMenuRef}
          style={{
            position: 'fixed',
            top: 0,
            left: sideMenuOpen ? 0 : -500,
            width: 340,
            height: '100vh',
            background: '#fff',
            boxShadow: '-2px 0 16px rgba(0,0,0,0.10)',
            zIndex: 3000,
            padding: 24,
            overflowY: 'auto',
            transition: 'left 0.5s ease-in-out',
          }}
        >
          <button
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              zIndex: 3100,
              pointerEvents: 'auto',
            }}
            onClick={() => setSideMenuOpen(false)}
            aria-label="Close filters"
          >
            ×
          </button>
          {/* Saved Filters and Save as filter at the top of the side menu */}
          <div style={{ marginBottom: 24 }}>
            <SavedFilters />
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {renderBrandsSelect()}
            {renderCategoriesSelect()}
            {renderColorsSelect()}
            {renderPriceSelect()}
            {renderSourceSelect()}
            {renderSaleSelect()}
          </div>
        </div>
      }
    </div>
  );
});

export default FilterBar; 