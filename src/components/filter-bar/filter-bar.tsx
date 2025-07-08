import React, { useState, useRef, useEffect } from 'react';
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

function CustomSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={styles.customSelect} ref={ref} tabIndex={0} onBlur={() => setOpen(false)}>
      <div className={styles.selected} onClick={() => setOpen((o) => !o)}>
        {value}
        <span className={styles.arrow} />
      </div>
      {open && (
        <ul className={styles.options}>
          {options.map((opt) => (
            <li
              key={opt}
              className={opt === value ? styles.active : ''}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterBar() {
  const [values, setValues] = useState({
    Sort: 'Relevance',
    Brand: 'All',
    Category: 'All',
    Colour: 'All',
    'Price Range': 'All',
  });

  function handleChange(label: string, value: string) {
    setValues((v) => ({ ...v, [label]: value }));
  }

  return (
    <div className={getClasses([styles.filterBar])}>
      <div className={styles.filterItem}>
        <label className={styles.label}>Search</label>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search for items and brands"
          aria-label="Search"
        />
      </div>
      {filterOptions.map((filter) => (
        <div key={filter.label} className={styles.filterItem}>
          <label className={styles.label}>{filter.label}</label>
          <CustomSelect
            options={filter.options}
            value={values[filter.label]}
            onChange={(val) => handleChange(filter.label, val)}
          />
        </div>
      ))}
    </div>
  );
}

export default FilterBar; 