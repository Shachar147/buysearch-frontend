import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './filter-bar.module.css';
import getClasses from '../../utils/get-classes';
import CustomSelect from '../custom-select/custom-select';
import filtersStore from '../../stores/filters-store';

const sortOptions = [
  { label: 'Relevance', value: 'Relevance' },
  { label: 'Price: Low to High', value: 'Price: Low to High' },
  { label: 'Price: High to Low', value: 'Price: High to Low' },
];
const priceRangeOptions = [
  { label: 'All', value: 'All' },
  { label: 'Up to 100 ILS', value: 'Up to 100 ILS', to: 100 },
  { label: '100-150 ILS', value: '100-150 ILS', from: 100, to: 150 },
  { label: '151-200 ILS', value: '151-200 ILS', from: 151, to: 200 },
  { label: '201-300 ILS', value: '201-300 ILS', from: 201, to: 300 },
  { label: '301-600 ILS', value: '301-600 ILS', from: 301, to: 600 },
  { label: '601-1000 ILS', value: '601-1000 ILS', from: 601, to: 1000 },
  { label: '1000+ ILS', value: '1000+ ILS', from: 1001 },
];

const toOption = (v: any) => {
  if (typeof v === 'string') return { label: v, value: v };
  if (v && typeof v === 'object' && 'name' in v) return { label: v.name, value: v.name };
  return { label: String(v), value: String(v) };
};

const FilterBar = observer(() => {
  const { brands, categories, colors, selected, setFilter, loading } = filtersStore;

  return (
    <div className={getClasses([styles.filterBar])}>
      <div className={styles.filterItem}>
        <label className={getClasses([styles.label, 'text-caption'])}>Sort</label>
        <CustomSelect
          options={sortOptions}
          selected={[selected.sort || 'Relevance']}
          onChange={vals => setFilter('sort', vals[0])}
          defaultLabel="Relevance"
        />
      </div>
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
      <div className={styles.filterItem}>
        <label className={getClasses([styles.label, 'text-caption'])}>Color</label>
        <CustomSelect
          options={[{ label: 'All', value: 'All' }, ...colors.map(toOption)]}
          selected={Array.isArray(selected.color) ? selected.color : [selected.color]}
          onChange={vals => setFilter('color', vals)}
          defaultLabel="All"
          multiselect
          itemType="colors"
        />
      </div>
      <div className={styles.filterItem}>
        <label className={getClasses([styles.label, 'text-caption'])}>Price Range</label>
        <CustomSelect
          options={priceRangeOptions.map(opt => typeof opt === 'object' ? opt : { label: String(opt), value: String(opt) })}
          selected={selected.priceRange && typeof selected.priceRange === 'object' && 'value' in selected.priceRange && selected.priceRange.value ? [String(selected.priceRange.value)] : ['All']}
          onChange={vals => {
            const found = priceRangeOptions.find(opt => (typeof opt === 'object' ? opt.value : opt) === vals[0]) || priceRangeOptions[0];
            setFilter('priceRange', found);
          }}
          defaultLabel="All"
        />
      </div>
    </div>
  );
});

export default FilterBar; 