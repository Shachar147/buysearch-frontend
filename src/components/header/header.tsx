"use client";

import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import filtersStore from '../../stores/filters-store';
import getClasses from '../../utils/get-classes';
import styles from './header.module.css';
import { isLoggedIn } from '../../utils/auth';
import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query';
import { FaRocket } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import AdminGuard, { isAdmin } from '../admin-guard';
import { NotificationCenter } from '../notification-center/notification-center';
import { MdCurrencyExchange } from "react-icons/md";

interface HeaderProps {
    hideGenderSwitch?: boolean;
    onGenderSwitch?: (gender: string) => void;
    onToggleFavourites?: (show: boolean) => void;
    showFavouritesOnly?: boolean;
    gender?: string;
    search?: string;
    onSearchChange?: (search: string) => void;
    onTogglePriceChange?: (show: boolean) => void;
    showPriceChangeOnly?: boolean;
    scrolled?: boolean;
    isStatusPage?: boolean;
}
const Header = (props: HeaderProps) => {

  const [loggedIn, setLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(props.scrolled);
  const isUserAdmin = isAdmin();
  const queryClient = useQueryClient();
  const router = useRouter();

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(props.scrolled || window.scrollY >= 100);
    }
    window.addEventListener('scroll', onScroll);
    onScroll(); // set initial
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleLogout() {
    Cookies.remove('accessToken');
    queryClient.invalidateQueries({ queryKey: ['saved-filters'] });
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
        <span className={styles.genderDivider} />
        <span
          className={getClasses([
            styles.genderOption,
            'text-headline-6',
            'color-white',
            filtersStore.selected.gender === 'unisex' && styles.genderOptionActive,
          ])}
          onClick={() => {
            filtersStore.setGender('unisex');
            if (props.onGenderSwitch) props.onGenderSwitch('unisex');
          }}
        >
          UNISEX
        </span>
      </div>
    )
  }

  function renderHeartIcon(){
    if (props.isStatusPage) {
      return;
    }

    return ( <span
        className={getClasses([
          styles.iconBtn,
          styles.heartIcon,
          props.showFavouritesOnly ? styles.heartFilled : undefined
        ])}
        title={props.showFavouritesOnly ? 'Show all products' : 'Show only favourites'}
        onClick={() => {
          if (props.onToggleFavourites) props.onToggleFavourites(!props.showFavouritesOnly);
        }}
        aria-pressed={props.showFavouritesOnly}
        role="button"
        tabIndex={0}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill={props.showFavouritesOnly ? 'var(--bs-red-5)' : scrolled ? 'var(--bs-black-6)' : 'none'} stroke={props.showFavouritesOnly ? 'var(--bs-red-5)' : scrolled ? 'var(--bs-black-6)' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.8 4.6c-1.5-1.4-3.9-1.4-5.4 0l-.7.7-.7-.7c-1.5-1.4-3.9-1.4-5.4 0-1.6 1.5-1.6 3.9 0 5.4l6.1 6.1c.2.2.5.2.7 0l6.1-6.1c1.6-1.5 1.6-3.9 0-5.4z"/>
        </svg>
      </span>
    );
  }

  function renderPriceChangeIcon(){
    if (props.isStatusPage) {
      return;
    }

    return (
      <span
            className={getClasses([
              styles.iconBtn,
              props.showPriceChangeOnly ? styles.heartFilled : undefined
            ])}
            title={props.showPriceChangeOnly ? 'Show all products' : 'Show only price-changed'}
            onClick={() => {
              if (props.onTogglePriceChange) props.onTogglePriceChange(!props.showPriceChangeOnly);
            }}
            aria-pressed={props.showPriceChangeOnly}
            role="button"
            tabIndex={0}
          >
            {/* Trend/graph icon */}
            <MdCurrencyExchange  style={{ fontSize: 22, color: props.showPriceChangeOnly ? 'var(--bs-red-5)' : scrolled ? 'var(--bs-black-6)' : '#fff' }} />
            {/* <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={props.showPriceChangeOnly ? 'var(--bs-red-5)' : scrolled ? 'var(--bs-black-6)' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 17 9 11 13 15 21 7" />
              <circle cx="3" cy="17" r="1.5" />
              <circle cx="9" cy="11" r="1.5" />
              <circle cx="13" cy="15" r="1.5" />
              <circle cx="21" cy="7" r="1.5" />
            </svg> */}
          </span>   
    )
  }

  function renderLogoutIcon(){
    return (
      <span
            className={getClasses([styles.iconBtn])}
            title="Logout"
            onClick={handleLogout}
            role="button"
            tabIndex={0}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={scrolled ? 'var(--bs-black-6)' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
              <path d="M12 19v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
            </svg>
          </span>   
    )
  }

  function renderAdminIcon(){
    return (
      <AdminGuard>
        <span
            className={getClasses([styles.iconBtn])}
            title="Status"
            onClick={() => router.push(props.isStatusPage ? '/' : '/status')}
            role="button"
            tabIndex={0}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FaRocket style={{ fontSize: 20, color: props.isStatusPage ? 'var(--bs-red-5)' : scrolled ? 'var(--bs-black-6)' : '#fff' }} />
          </span>
      </AdminGuard>
    )
  }

  return (
    <header className={getClasses([styles.header, scrolled && styles.scrolled])}>
      <div className={getClasses([styles.logo, 'text-headline-4', 'color-white', 'cursor-pointer'])} onClick={() => window.location.href = loggedIn ? '/' : '/login'}>
      <div className={styles.logoImage} />
      </div>
      {/* {renderGenderSwitch()} */}
      {loggedIn && (
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? isUserAdmin ? 0 : 8 : 16 }}>
          {/* Heart (favorites) icon */}
          {renderHeartIcon()}
          {/* Price Change icon */}
          {renderPriceChangeIcon()}
          {/* Notification center */}
          {loggedIn && <NotificationCenter scrolled={scrolled} />}
          {/* Status icon */}
          {renderAdminIcon()}
          {/* Logout icon */}
          {renderLogoutIcon()}
        </div>
      )}
    </header>
  );
};

export default observer(Header); 