import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './custom-select.module.css';
import getClasses from '../../utils/get-classes';

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  defaultLabel?: string;
  multiselect?: boolean;
  itemType?: string;
}

const CustomSelect = observer(function CustomSelect({ options, itemType, selected, onChange, placeholder = 'Select...', defaultLabel = 'All', multiselect = false }: CustomSelectProps) {
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
  let displayLabel: string;
  if (multiselect && safeSelected.length > 2) {
    // Exclude 'All' from the count
    const count = safeSelected.filter(v => v !== 'All').length;
    let word = itemType ?? 'items';
    displayLabel = `${count} ${word}`;
  } else {
    displayLabel = safeSelected.length === 0 || (safeSelected.length === 1 && safeSelected[0] === defaultLabel)
      ? defaultLabel
      : safeSelected.join(', ');
  }

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
    <div className={getClasses([styles.customSelect, isActive && styles.activeSelect])} ref={ref}>
      <div className={getClasses([styles.selected, isActive && styles.activeSelect, 'text-body'])} onClick={() => setOpen((o) => !o)}>
        {displayLabel}
        {isActive ? (
          <span
            className={getClasses([styles.clearIcon, 'text-body'])}
            onClick={e => {
              e.stopPropagation();
              if (multiselect) {
                onChange([defaultLabel]);
              } else {
                onChange([defaultLabel]);
              }
              setOpen(false);
            }}
            title="Clear filter"
            style={{ cursor: 'pointer', marginLeft: 8, fontWeight: 700, color: '#d72660', fontSize: 18 }}
          >
            ×
          </span>
        ) : (
          <span className={styles.arrow} />
        )}
      </div>
      {open && (
        <div className={styles.dropdown}>
          <input
            className={getClasses([styles.searchInput, 'text-body'])}
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
                className={getClasses([
                  safeSelected.includes(opt.value) ? styles.active : '',
                  'text-body',
                  opt.disabled && 'text-disabled',
                ])}
                onClick={!multiselect && !opt.disabled ? () => selectSingle(opt.value) : undefined}
                style={!multiselect ? { cursor: 'pointer' } : {}}
                aria-disabled={opt.disabled}
              >
                {multiselect ? (
                  <label className={getClasses([styles.checkboxLabel, 'text-body', opt.disabled && 'text-disabled'])}>
                    <input
                      type="checkbox"
                      checked={safeSelected.includes(opt.value)}
                      onChange={() => !opt.disabled && toggleOption(opt.value)}
                      onClick={e => e.stopPropagation()}
                      disabled={opt.disabled}
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