import React from 'react';
import filtersStore from '../../stores/filters-store';
import getClasses from '../../utils/get-classes';
import styles from './header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={getClasses([styles.logo, 'text-headline-4', 'color-white'])}>BUYSEARCH</div>
      <div className={styles.genderSwitch}>
        <span
          className={getClasses([
            styles.genderOption,
            'text-headline-6',
            'color-white',
            filtersStore.selected.gender === 'women' && styles.genderOptionActive,
          ])}
          onClick={() => filtersStore.setGender('women')}
        >
          WOMEN
        </span>
        <span className={styles.genderDivider} />
        <span
          className={getClasses([
            styles.genderOption,
            'text-headline-6',
            'color-white',
            filtersStore.selected.gender === 'men' && styles.genderOptionActive,
          ])}
          onClick={() => filtersStore.setGender('men')}
        >
          MEN
        </span>
      </div>
      <div className={styles.headerSearch}>
        <input
          className={styles.headerSearchInput}
          type="text"
          placeholder="Search for items and brands"
          aria-label="Search"
          value={filtersStore.selected.search}
          onChange={e => filtersStore.setFilter('search', e.target.value)}
        />
      </div>
    </header>
  );
};

export default Header; 