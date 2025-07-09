import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import filtersStore from '../../stores/filters-store';
import getClasses from '../../utils/get-classes';
import styles from './header.module.css';
import { isLoggedIn } from '../../utils/auth';
import Cookies from 'js-cookie';

interface HeaderProps {
    hideSearch?: boolean;
    hideGenderSwitch?: boolean;
    onGenderSwitch?: (gender: string) => void;
    onToggleFavourites?: (show: boolean) => void;
    showFavouritesOnly?: boolean;
}
const Header = (props: HeaderProps) => {

  const [loggedIn, setLoggedIn] = useState(false);
  const [showFavourites, setShowFavourites] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  function handleLogout() {
    Cookies.remove('accessToken');
    window.location.reload();
  }

  function handleToggleFavourites() {
    const newVal = !showFavourites;
    setShowFavourites(newVal);
    if (props.onToggleFavourites) props.onToggleFavourites(newVal);
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
          onClick={() => {
            filtersStore.setGender('women');
            if (props.onGenderSwitch) props.onGenderSwitch('women');
          }}
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
          onClick={() => {
            filtersStore.setGender('men');
            if (props.onGenderSwitch) props.onGenderSwitch('men');
          }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Heart (favorites) icon */}
          {!props.hideGenderSwitch && <span
            className={getClasses([
              styles.iconBtn,
              props.showFavouritesOnly ? styles.heartFilled : undefined
            ])}
            title={props.showFavouritesOnly ? 'Show all products' : 'Show only favourites'}
            onClick={() => {
              if (props.onToggleFavourites) props.onToggleFavourites(!props.showFavouritesOnly);
            }}
            aria-pressed={props.showFavouritesOnly}
            role="button"
            tabIndex={0}
            style={{ 
              paddingTop: "6px",
              paddingInlineEnd: "6px"
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill={props.showFavouritesOnly ? 'var(--bs-red-5)' : 'none'} stroke={props.showFavouritesOnly ? 'var(--bs-red-5)' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6c-1.5-1.4-3.9-1.4-5.4 0l-.7.7-.7-.7c-1.5-1.4-3.9-1.4-5.4 0-1.6 1.5-1.6 3.9 0 5.4l6.1 6.1c.2.2.5.2.7 0l6.1-6.1c1.6-1.5 1.6-3.9 0-5.4z"/>
            </svg>
          </span>}
          {/* Logout icon */}
          {!props.hideGenderSwitch && <span
            className={getClasses([styles.iconBtn])}
            title="Logout"
            onClick={handleLogout}
            role="button"
            tabIndex={0}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
              <path d="M12 19v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
            </svg>
          </span>}
        </div>
      )}
    </header>
  );
};

export default observer(Header); 