import React from 'react';
import styles from './filter-bar.module.css';
import getClasses from '../../utils/get-classes';

// todo: load brands, categories, colors from server.
// todo: set default price range for example up to 100 ILS, 100-150, 150-200, etc
const filterOptions = [
  { label: 'Sort', options: ['Relevance', 'Price: Low to High', 'Price: High to Low'] },
  { label: 'Brand', options: ['All'] },
  { label: 'Category', options: ['All'] },
  { label: 'Colour', options: ['All'] },
  { label: 'Price Range', options: ['All'] },
];

function FilterBar() {
  return (
    <div className={getClasses([styles.filterBar, 'flex-row', 'gap-16', 'flex-wrap'])}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search for items and brands"
        aria-label="Search"
      />
      {filterOptions.map((filter) => (
        <div key={filter.label} className={styles.filterItem}>
          <label className={styles.label}>{filter.label}</label>
          <select className={styles.select}>
            {filter.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export default FilterBar; 