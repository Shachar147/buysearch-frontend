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
  renderCustomContent?: (() => React.ReactNode) | undefined;
  disableAlphabetSorting?: boolean;
}

const CustomSelect = observer(function CustomSelect({ options, itemType, selected, onChange, placeholder = 'Select...', defaultLabel = 'All', multiselect = false, renderCustomContent, disableAlphabetSorting = false }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const initialSelected = useRef<string[]>([]);

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
  let filteredOptions = options.filter(opt => (typeof opt.label === 'string' ? opt.label.toLowerCase() : '').includes(search.toLowerCase()));
  // On initial open for multiselect, show selected items first (from initialSelected) until dropdown is closed
  let selectedSet = new Set<string>();
  if (multiselect && open) {
    // Use the snapshot from when dropdown was opened
    selectedSet = new Set(initialSelected.current.map(v => v.trim().toLowerCase()));
    const allOption = filteredOptions.find(opt => opt.value === defaultLabel);
    const restOptions = filteredOptions.filter(opt => opt.value !== defaultLabel);
    const selectedOptions = restOptions.filter(opt => selectedSet.has(opt.value.trim().toLowerCase()));
    const unselectedOptions = restOptions.filter(opt => !selectedSet.has(opt.value.trim().toLowerCase()));
    const sortFn = (a: Option, b: Option) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
    const sortedSelected = disableAlphabetSorting ? selectedOptions : [...selectedOptions].sort(sortFn);
    const sortedUnselected = disableAlphabetSorting ? unselectedOptions : [...unselectedOptions].sort(sortFn);
    filteredOptions = [
      ...(allOption ? [allOption] : []),
      ...sortedSelected,
      ...sortedUnselected,
    ];
  } else if (!disableAlphabetSorting) {
    // Always sort alphabetically if not disabled (for single select or after user interaction)
    const allOption = filteredOptions.find(opt => opt.value === defaultLabel);
    const restOptions = filteredOptions.filter(opt => opt.value !== defaultLabel);
    filteredOptions = [
      ...(allOption ? [allOption] : []),
      ...restOptions.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })),
    ];
  }

  const isActive = safeSelected.length > 0 && !(safeSelected.length === 1 && safeSelected[0] === defaultLabel);
  const customSelected = safeSelected.length === 1 && (safeSelected[0].toLowerCase().startsWith('custom') || safeSelected[0] === 'Custom');
  let displayLabel: string;
  if (multiselect && safeSelected.length > 2) {
    // Exclude 'All' from the count
    const count = safeSelected.filter(v => v !== 'All').length;
    let word = itemType ?? 'items';
    displayLabel = `${count} ${word}`;
  } else if (customSelected && options) {
    // Try to find the custom option and show its label if it contains a range
    const customOpt = options.find(opt => opt.value === 'Custom');
    if (customOpt && typeof customOpt.label === 'string' && customOpt.label.toLowerCase().startsWith('custom:')) {
      displayLabel = customOpt.label;
    } else {
      displayLabel = 'Custom';
    }
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
    if (value === 'Custom') {
      onChange([value]);
      // Do not close dropdown for custom
      return;
    }
    onChange([value]);
    setOpen(false);
  }

  // Utility for normalized comparison
  function isSelected(value: string) {
    return safeSelected.map(v => v.trim().toLowerCase()).includes(value.trim().toLowerCase());
  }

  return (
    <div className={getClasses([styles.customSelect, isActive && styles.activeSelect])} ref={ref}>
      <div
        className={getClasses([styles.selected, isActive && styles.activeSelect, 'text-body'])}
        onClick={() => {
          setOpen((o) => {
            const willOpen = !o;
            if (willOpen && multiselect) {
              initialSelected.current = [...safeSelected];
            }
            return willOpen;
          });
        }}
      >
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
                  isSelected(opt.value) ? styles.active : '',
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
                      checked={isSelected(opt.value)}
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
          {renderCustomContent && customSelected && (
            <div className={styles.customContentContainer}>{renderCustomContent()}</div>
          )}
        </div>
      )}
    </div>
  );
});

export default CustomSelect; 