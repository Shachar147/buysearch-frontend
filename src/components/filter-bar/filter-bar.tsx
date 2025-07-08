import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './filter-bar.module.css';
import getClasses from '../../utils/get-classes';
import CustomSelect from '../custom-select/custom-select';
import filtersStore from '../../stores/filters-store';

const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low'];
const priceRangeOptions = [
  'All',
  'Up to 100 ILS',
  '100-150 ILS',
  '150-200 ILS',
  '200-300 ILS',
  '300+ ILS',
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
          options={priceRangeOptions}
          value={selected.priceRange}
          onChange={val => setFilter('priceRange', val)}
        />
      </div>
    </div>
  );
});

export default FilterBar; 