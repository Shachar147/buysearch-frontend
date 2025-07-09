import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import filtersStore from '../../stores/filters-store';
import getClasses from '../../utils/get-classes';
import styles from './header.module.css';
import { isLoggedIn } from '../../utils/auth';
import Cookies from 'js-cookie';

interface HeaderProps {
    hideSearch?: boolean;
    hideGenderSwitch?: boolean
}
const Header = (props: HeaderProps) => {

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  function handleLogout() {
    Cookies.remove('accessToken');
    window.location.reload();
  }

  function renderGenderSwitch(){
    if (props.hideGenderSwitch) {
        return;
    }
    return (
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
    )
  }

  function renderSearch(){
    if (props.hideSearch) {
        return;
    }
    const hasSearch = !!filtersStore.selected.search;
    return (
        <div className={styles.headerSearch}>
          <input
            className={getClasses([
              styles.headerSearchInput,
              hasSearch && styles.activeSearchBar
            ])}
            type="text"
            placeholder="Search for items and brands"
            aria-label="Search"
            value={filtersStore.selected.search}
            onChange={e => filtersStore.setFilter('search', e.target.value)}
            style={{ paddingRight: hasSearch ? 44 : 18 }}
          />
          {hasSearch && (
            <button
              type="button"
              className={styles.clearSearchIcon}
              onClick={() => filtersStore.setFilter('search', '')}
              title="Clear search"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
    )
  }

  return (
    <header className={styles.header}>
      <div className={getClasses([styles.logo, 'text-headline-4', 'color-white', 'cursor-pointer'])} onClick={() => window.location.href = loggedIn ? '/' : '/login'}>
        BUYSEARCH
      </div>
      {renderGenderSwitch()}
      {renderSearch()}
      {loggedIn && (
        <a className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </a>
      )}
    </header>
  );
};

export default observer(Header); 