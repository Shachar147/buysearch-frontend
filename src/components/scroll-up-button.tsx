import React, { useEffect, useState } from 'react';
import getClasses from '../utils/get-classes';
import styles from '../app/page.module.css';

interface ScrollUpButtonProps {
  show: boolean;
}

const ScrollUpButton: React.FC<ScrollUpButtonProps> = ({ show }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowButton(window.scrollY >= 1000);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show || !showButton) return null;

  return (
    <button
      className={getClasses([styles.scrollUpBtn, 'text-headline-4', 'color-white'])}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      ⌃
    </button>
  );
};

export default ScrollUpButton; 