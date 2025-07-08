import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './custom-select.module.css';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  defaultLabel?: string;
  multiselect?: boolean;
}

const CustomSelect = observer(function CustomSelect({ options, selected, onChange, placeholder = 'Select...', defaultLabel = 'All', multiselect = false }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  const safeSelected = Array.isArray(selected) ? selected : [];
  const filteredOptions = options.filter(opt => (typeof opt.label === 'string' ? opt.label.toLowerCase() : '').includes(search.toLowerCase()));
  const isActive = safeSelected.length > 0 && !(safeSelected.length === 1 && safeSelected[0] === defaultLabel);
  const displayLabel = safeSelected.length === 0 || (safeSelected.length === 1 && safeSelected[0] === defaultLabel)
    ? defaultLabel
    : safeSelected.join(', ');

  function toggleOption(value: string) {
    if (value === defaultLabel) {
      onChange([defaultLabel]);
      return;
    }
    let newSelected = safeSelected.filter(v => v !== defaultLabel);
    if (newSelected.includes(value)) {
      newSelected = newSelected.filter(v => v !== value);
    } else {
      newSelected = [...newSelected, value];
    }
    if (newSelected.length === 0) newSelected = [defaultLabel];
    onChange(newSelected);
  }

  function selectSingle(value: string) {
    onChange([value]);
    setOpen(false);
  }

  return (
    <div className={styles.customSelect + (isActive ? ' ' + styles.activeSelect : '')} ref={ref}>
      <div className={styles.selected} onClick={() => setOpen((o) => !o)}>
        {displayLabel}
        <span className={styles.arrow} />
      </div>
      {open && (
        <div className={styles.dropdown}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <ul className={styles.options}>
            {filteredOptions.map((opt, idx) => (
              <li
                key={opt.value || opt.label || idx}
                className={safeSelected.includes(opt.value) ? styles.active : ''}
                onClick={!multiselect ? () => selectSingle(opt.value) : undefined}
                style={!multiselect ? { cursor: 'pointer' } : {}}
              >
                {multiselect ? (
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={safeSelected.includes(opt.value)}
                      onChange={() => toggleOption(opt.value)}
                      onClick={e => e.stopPropagation()}
                    />
                    <span>{opt.label}</span>
                  </label>
                ) : (
                  <span>{opt.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default CustomSelect; 