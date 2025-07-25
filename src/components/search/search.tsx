'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './search.module.css';
import { useParsedSearchQuery } from '../../api/search/queries';
import filtersStore from '../../stores/filters-store';
import getClasses from '../../utils/get-classes';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const Search: React.FC<SearchProps> = ({ value, onChange, placeholder = 'Search for items and brands' }) => {
  const [localValue, setLocalValue] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedValue(localValue);
    }, 400);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [localValue]);

  const { data: parsedFilters } = useParsedSearchQuery(debouncedValue, {
    // @ts-ignore
    cacheTime: 1000 * 60 * 10, // 10 minutes
    staleTime: 1000 * 60 * 5,  // 5 minutes
  });

  useEffect(() => {
    if (parsedFilters) {
      filtersStore.applyParsedFilters(parsedFilters);
    }
    filtersStore.setSearchFilter(localValue);
  }, [parsedFilters]);

  const hasValue = !!localValue;

  return (
    <div className={getClasses([styles.heroSearchBar, !!debouncedValue && styles.active])}>
      <span className={styles.heroSearchIcon}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="10" cy="10" r="7" stroke="#888" strokeWidth="2"/>
          <line x1="16" y1="16" x2="21" y2="21" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </span>
      <input
        className={styles.heroSearchInput}
        type="text"
        placeholder={placeholder}
        aria-label="Search"
        value={localValue}
        onChange={e => {
          setLocalValue(e.target.value);
          onChange(e.target.value);
        }}
      />
      {hasValue && (
        <button
          type="button"
          className={styles.heroClearIcon}
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          title="Clear search"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Search; 