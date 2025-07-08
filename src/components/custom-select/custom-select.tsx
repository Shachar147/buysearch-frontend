import React, { useState, useRef, useEffect } from 'react';
import styles from './custom-select.module.css';

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

function CustomSelect({ options, value, onChange }: CustomSelectProps) {
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

export default CustomSelect; 