import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from './filter-bar.module.css';
import getClasses from '../../utils/get-classes';
import CustomSelect from '../custom-select/custom-select';
import filtersStore from '../../stores/filters-store';
import { priceRangeOptions } from '../../stores/filters-store';
import { ucfirst } from '../../utils/utils';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const sortOptions = [
  { label: 'Relevance', value: 'Relevance' },
  { label: 'Price: Low to High', value: 'Price: Low to High' },
  { label: 'Price: High to Low', value: 'Price: High to Low' },
];

const toOption = (v: any) => {
  if (typeof v === 'string') return { label: v, value: v };
  if (v && typeof v === 'object' && 'name' in v) return { label: v.name, value: v.name };
  return { label: String(v), value: String(v) };
};

const FilterBar = observer(() => {
  const { brands, categories, colors, selected, setFilter, loading } = filtersStore;
  const isCustom = selected.priceRange && typeof selected.priceRange === 'object' && selected.priceRange.label && selected.priceRange.label.startsWith('Custom');
  const min = 0;
  const max = 2000;
  const step = 10;
  const from = typeof selected.priceRange === 'object' && 'from' in selected.priceRange && typeof selected.priceRange.from === 'number' ? selected.priceRange.from : min;
  const to = typeof selected.priceRange === 'object' && 'to' in selected.priceRange && typeof selected.priceRange.to === 'number' ? selected.priceRange.to : max;
  const sliderValue: [number, number] = [from, to];

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
          options={[{ label: 'All', value: 'All' }, ...colors.map(toOption)].map((o) => ({ value: ucfirst(o.value), label: ucfirst(o.label) }))}
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
          renderCustomContent={() => (
            <div className={styles.sliderContainer}>
              <Slider
                range
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                onChange={(val) => {
                  if (Array.isArray(val) && val.length === 2) {
                    setFilter('priceRange', { label: `Custom: ${val[0]} - ${val[1]} ILS`, from: val[0], to: val[1], value: 'Custom' });
                  }
                }}
                allowCross={false}
                trackStyle={[{ backgroundColor: 'var(--bs-red-5)', height: 6, paddingInline: '20px' }]}
                handleStyle={[
                  { borderColor: 'var(--bs-red-5)', backgroundColor: 'var(--bs-white)', boxShadow: '0 0 0 2px var(--bs-red-1)', height: 22, width: 22 },
                  { borderColor: 'var(--bs-red-5)', backgroundColor: 'var(--bs-white)', boxShadow: '0 0 0 2px var(--bs-red-1)', height: 22, width: 22 }
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
    </div>
  );
});

export default FilterBar; 