import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './filter-bar.module.css';
import getClasses from '../../utils/get-classes';
import CustomSelect from '../custom-select/custom-select';
import filtersStore from '../../stores/filters-store';

const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low'];
const priceRangeOptions = [
  { label: 'All' },
  { label: 'Up to 100 ILS', to: 100 },
  { label: '100-150 ILS', from: 100, to: 150 },
  { label: '151-200 ILS', from: 151, to: 200 },
  { label: '201-300 ILS', from: 201, to: 300 },
  { label: '301-600 ILS', from: 301, to: 600 },
  { label: '601-1000 ILS', from: 601, to: 1000 },
  { label: '1000+ ILS', from: 1001 },
];

const FilterBar = observer(() => {
  const { brands, categories, colors, selected, setFilter, loading } = filtersStore;

  return (
    <div className={getClasses([styles.filterBar])}>
      <div className={styles.filterItem}>
        <label className={styles.label}>Search</label>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search for items and brands"
          aria-label="Search"
          value={selected.search}
          onChange={e => setFilter('search', e.target.value)}
          disabled={!!loading}
        />
      </div>
      <div className={styles.filterItem}>
        <label className={styles.label}>Sort</label>
        <CustomSelect
          options={sortOptions}
          value={selected.sort}
          onChange={val => setFilter('sort', val)}
        />
      </div>
      <div className={styles.filterItem}>
        <label className={styles.label}>Brand</label>
        <CustomSelect
          options={['All', ...brands.map(b => b.name || b)]}
          value={selected.brand}
          onChange={val => setFilter('brand', val)}
        />
      </div>
      <div className={styles.filterItem}>
        <label className={styles.label}>Category</label>
        <CustomSelect
          options={['All', ...categories.map(c => c.name || c)]}
          value={selected.category}
          onChange={val => setFilter('category', val)}
        />
      </div>
      <div className={styles.filterItem}>
        <label className={styles.label}>Colour</label>
        <CustomSelect
          options={['All', ...colors.map(c => c.name || c)]}
          value={selected.color}
          onChange={val => setFilter('color', val)}
        />
      </div>
      <div className={styles.filterItem}>
        <label className={styles.label}>Price Range</label>
        <CustomSelect
          options={priceRangeOptions.map(opt => opt.label)}
          value={selected.priceRange?.label || 'All'}
          onChange={val => setFilter('priceRange', priceRangeOptions.find(opt => opt.label === val))}
        />
      </div>
    </div>
  );
});

export default FilterBar; 