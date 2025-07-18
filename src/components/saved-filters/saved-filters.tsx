"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import { useSavedFilters } from '../../api/saved-filters/queries';
import { useCreateSavedFilter, useDeleteSavedFilter, useUpdateSavedFilter, useUpdateSavedFilterLastUsed } from '../../api/saved-filters/mutations';
import filtersStore from '../../stores/filters-store';
import { isLoggedIn } from '../../utils/auth';
import styles from './saved-filters.module.css';
import getClasses from '../../utils/get-classes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders, faPen, faTrash, faPlus, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

function areFiltersEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const SavedFilters = observer(() => {
  const { data: savedFilters = [], isLoading } = useSavedFilters();
  const createSavedFilter = useCreateSavedFilter();
  const deleteSavedFilter = useDeleteSavedFilter();
  const updateSavedFilter = useUpdateSavedFilter();
  const updateSavedFilterLastUsed = useUpdateSavedFilterLastUsed();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editFiltersId, setEditFiltersId] = useState<number | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const iconBtnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [lastLoadedFilterId, setLastLoadedFilterId] = useState<number | null>(null);

  useEffect(() => {
    if (isPopoverOpen && iconBtnRef.current) {
      const rect = iconBtnRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  }, [isPopoverOpen]);

  // Close popover on outside click or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && iconBtnRef.current && !iconBtnRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
        // setEditId(null);
        // setEditFiltersId(null);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsPopoverOpen(false);
        // setEditId(null);
        // setEditFiltersId(null);
      }
    }
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isPopoverOpen]);

  if (!isLoggedIn()) return null;

  const hasActiveFilters = () => {
    const { selected } = filtersStore;
    return (
      (Array.isArray(selected.brand) ? selected.brand.some((b: string) => b !== 'All') : selected.brand !== 'All') ||
      (Array.isArray(selected.category) ? selected.category.some((c: string) => c !== 'All') : selected.category !== 'All') ||
      (Array.isArray(selected.color) ? selected.color.some((c: string) => c !== 'All') : selected.color !== 'All') ||
      (selected.source && Array.isArray(selected.source) && selected.source.some((s: string) => s !== 'All')) ||
      selected.sort !== 'Relevance' ||
      selected.isFavourite ||
      selected.withPriceChange ||
      selected.isOnSale !== undefined ||
      (selected.priceRange && selected.priceRange.label !== 'All')
    );
  };

  const handleSaveFilter = async (name: string) => {
    try {
      const { selected } = filtersStore;
      await createSavedFilter.mutateAsync({
        name,
        filters: {
          sort: selected.sort,
          brand: Array.isArray(selected.brand) ? selected.brand : [selected.brand],
          category: Array.isArray(selected.category) ? selected.category : [selected.category],
          color: Array.isArray(selected.color) ? selected.color : [selected.color],
          priceRange: selected.priceRange,
          gender: selected.gender,
          isFavourite: selected.isFavourite,
          withPriceChange: selected.withPriceChange,
          // @ts-ignore
          source: selected.source,
          isOnSale: selected.isOnSale,
        },
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  const handleLoadFilter = (savedFilter: any) => {
    const { filters } = savedFilter;
    filtersStore.setFilter('sort', filters.sort || 'Relevance');
    filtersStore.setFilter('brand', filters.brand || ['All']);
    filtersStore.setFilter('category', filters.category || ['All']);
    filtersStore.setFilter('color', filters.color || ['All']);
    filtersStore.setFilter('priceRange', filters.priceRange || { label: 'All' });
    filtersStore.setFilter('gender', filters.gender || 'men');
    filtersStore.setFilter('isFavourite', filters.isFavourite || false);
    filtersStore.setFilter('withPriceChange', filters.withPriceChange || false);
    filtersStore.setFilter('source', filters.source || ['All']);
    filtersStore.setFilter('isOnSale', filters.isOnSale);
    setLastLoadedFilterId(savedFilter.id);
    updateSavedFilterLastUsed.mutate(savedFilter.id);
  };

  const handleDeleteFilter = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this filter set?')) {
      try {
        await deleteSavedFilter.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete filter:', error);
      }
    }
  };

  const handleEditFilter = (filter: any) => {
    setEditId(filter.id);
    setEditName(filter.name);
  };

  const handleEditSave = async (filter: any) => {
    try {
      await updateSavedFilter.mutateAsync({ id: filter.id, data: { name: editName, filters: filter.filters } });
      setEditId(null);
      setEditName('');
    } catch (error) {
      console.error('Failed to update filter:', error);
    }
  };

  const handleEditFilters = (filter: any) => {
    handleLoadFilter(filter);
    setEditFiltersId(filter.id);
    setEditId(null);
    setEditName(filter.name);
    setIsPopoverOpen(false);
  };

  const handleSaveEditedFilters = async (filter: any) => {
    try {
      const { selected } = filtersStore;
      await updateSavedFilter.mutateAsync({
        id: filter.id,
        data: {
          name: editName,
          filters: {
            sort: selected.sort,
            brand: Array.isArray(selected.brand) ? selected.brand : [selected.brand],
            category: Array.isArray(selected.category) ? selected.category : [selected.category],
            color: Array.isArray(selected.color) ? selected.color : [selected.color],
            priceRange: selected.priceRange,
            gender: selected.gender,
            isFavourite: selected.isFavourite,
            withPriceChange: selected.withPriceChange,
            // @ts-ignore
            source: selected.source,
            isOnSale: selected.isOnSale,
          },
        },
      });
      setEditFiltersId(null);
      setEditId(null);
      setEditName('');
      setIsPopoverOpen(false);
    } catch (error) {
      console.error('Failed to update filter:', error);
    }
  };

  // Check if current filters match any saved filter
  const currentFilters = (() => {
    const { selected } = filtersStore;
    return {
      sort: selected.sort,
      brand: Array.isArray(selected.brand) ? selected.brand : [selected.brand],
      category: Array.isArray(selected.category) ? selected.category : [selected.category],
      color: Array.isArray(selected.color) ? selected.color : [selected.color],
      priceRange: selected.priceRange,
      gender: selected.gender,
      isFavourite: selected.isFavourite,
      withPriceChange: selected.withPriceChange,
      // @ts-ignore
      source: selected.source,
      isOnSale: selected.isOnSale,
    };
  })();
  const hasExactFilterset = savedFilters.some(f => areFiltersEqual(f.filters, currentFilters));

  // Popover content
  const popoverContent = (
    <div
      className={getClasses([styles.popover, 'flex-column', 'gap-4'])}
      ref={popoverRef}
      style={popoverPos ? { top: popoverPos.top, left: popoverPos.left, position: 'absolute', zIndex: 9999 } : {}}
    >
      <div className={getClasses([styles.popoverHeader, 'flex', 'items-center', 'gap-4'])}>
        <span className={getClasses([styles.popoverTitle, 'flex-1'])}>Saved Filters</span>
        {hasActiveFilters() && !hasExactFilterset && (
          <button
            onClick={() => { setIsModalOpen(true); setEditName(''); }}
            disabled={createSavedFilter.isPending}
            className={getClasses([styles.saveButton, styles.saveButtonCircle, 'color-white', 'bg-red-6', styles.smallButton])}
            title="Save current filters"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>
      {isLoading ? (
        <div className={getClasses([styles.loading])}>Loading...</div>
      ) : savedFilters.length === 0 ? (
        <div className={getClasses([styles.empty])}>No saved filters yet.</div>
      ) : (
        <div className={getClasses([styles.filterList])}>
          {savedFilters.map((filter) => {
            const isEditing = editId === filter.id;
            const isEditingFilters = editFiltersId === filter.id;
            return (
              <div key={filter.id} className={getClasses([styles.filterItem, 'flex', 'items-center', styles.filterRowBg])}>
                <div className={getClasses(['flex', 'flex-column', 'items-start', 'flex-1'])}>
                  <span className={getClasses([styles.filterName])} title={filter.name}>{filter.name}</span>
                  <span className={getClasses([styles.filterDate])}>{
                    (() => {
                      const d = new Date(filter.createdAt);
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const year = d.getFullYear();
                      return `${day}/${month}/${year}`;
                    })()
                  }</span>
                </div>
                <div className={getClasses(['flex', 'gap-4', 'justify-center', styles.actionButtons])}>
                  {isEditing ? (
                    <>
                      <input
                        className={styles.editInput}
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleEditSave(filter);
                          if (e.key === 'Escape') { setEditId(null); setEditName(''); }
                        }}
                        autoFocus
                      />
                      <button className={getClasses([styles.saveButton, styles.smallButton, 'bg-blue-5', 'color-white'])} onClick={() => handleEditSave(filter)} disabled={updateSavedFilter.isPending} title="Save">
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button className={getClasses([styles.cancelButton, styles.smallButton])} onClick={() => { setEditId(null); setEditName(''); }} title="Cancel">
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </>
                  ) : isEditingFilters ? (
                    <>
                      <input
                        className={styles.editInput}
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                      />
                      <button className={getClasses([styles.saveButton, styles.smallButton, 'bg-blue-5', 'color-white'])} onClick={() => handleSaveEditedFilters(filter)} disabled={updateSavedFilter.isPending} title="Save">
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button className={getClasses([styles.cancelButton, styles.smallButton])} onClick={() => { setEditFiltersId(null); setEditName(''); }} title="Cancel">
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className={getClasses([styles.loadButton, 'bg-blue-5', 'color-white'])} onClick={() => handleLoadFilter(filter)}>Load</button>
                      <button className={getClasses([styles.editButton, 'border', 'color-purple-6', styles.smallButton])} onClick={() => handleEditFilter(filter)} title="Rename">
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button className={getClasses([styles.editButton, 'border', 'color-purple-6', styles.smallButton])} onClick={() => handleEditFilters(filter)} title="Edit Filters">
                        <FontAwesomeIcon icon={faSliders} />
                      </button>
                      <button className={getClasses([styles.deleteButton, 'bg-red-6', 'color-white', styles.smallButton])} onClick={() => handleDeleteFilter(filter.id)} disabled={deleteSavedFilter.isPending}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Add Save as filterset button next to Saved Filtersets button if filters are active, not already saved, and not just loaded
  const showSaveAsFilterset = hasActiveFilters() && !hasExactFilterset && lastLoadedFilterId === null;

  // If filters change (user modifies after loading), allow save as filterset again
  useEffect(() => {
    setLastLoadedFilterId(null);
  }, [JSON.stringify(currentFilters)]);

  return (
    <>
      <div className={getClasses([styles.popoverWrapper, 'flex', 'items-center', 'gap-2'])}>
        <button
          className={getClasses([styles.iconButton, 'bg-red-6', 'color-white'])}
          ref={iconBtnRef}
          onClick={() => setIsPopoverOpen((v) => !v)}
          aria-label="Show saved filters"
        >
          Saved Filtersets
        </button>
        {editFiltersId && (
          <div className={getClasses(['flex-row', 'align-items-center', 'gap-8', styles.editingBanner])}>
            <span>Editing filterset: <b>{savedFilters.find(f => f.id === editFiltersId)?.name}</b></span>
            <button
              className={getClasses([styles.saveButton, styles.smallButton, 'bg-blue-5', 'color-white'])}
              onClick={() => handleSaveEditedFilters(savedFilters.find(f => f.id === editFiltersId))}
              title="Save"
            >
              <FontAwesomeIcon icon={faCheck} />
            </button>
            <button
              className={getClasses([styles.cancelButton, styles.smallButton])}
              onClick={() => { setEditFiltersId(null); setEditName(''); }}
              title="Cancel"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        )}
        {showSaveAsFilterset && !editFiltersId && (
          <button
            className={getClasses([styles.saveButton, styles.smallButton, 'color-blue-5', 'bg-transparent', styles.linkButton])}
            onClick={() => { setIsModalOpen(true); setEditName(''); }}
            disabled={createSavedFilter.isPending}
            style={{ textDecoration: 'underline', fontWeight: 500 }}
          >
            <FontAwesomeIcon icon={faPlus} /> Save as filterset
          </button>
        )}
        {isPopoverOpen && popoverPos && createPortal(popoverContent, document.body)}
      </div>
      {/* Modal for saving new filter */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Save Filter Set</h3>
            <input
              type="text"
              placeholder="Enter filter set name..."
              value={editName}
              onChange={e => setEditName(e.target.value)}
              autoFocus
              disabled={createSavedFilter.isPending}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setIsModalOpen(false)} disabled={createSavedFilter.isPending}>Cancel</button>
              <button onClick={() => { handleSaveFilter(editName); setEditName(''); }} disabled={!editName.trim() || createSavedFilter.isPending}>
                {createSavedFilter.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default SavedFilters; 