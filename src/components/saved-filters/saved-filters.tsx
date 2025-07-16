import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useSavedFilters, useCreateSavedFilter, useDeleteSavedFilter } from '../../api/saved-filters/queries';
import filtersStore from '../../stores/filters-store';
import { isLoggedIn } from '../../utils/auth';
import styles from './saved-filters.module.css';

interface SaveFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isLoading: boolean;
}

const SaveFilterModal: React.FC<SaveFilterModalProps> = ({ isOpen, onClose, onSave, isLoading }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Save Filter Set</h3>
        <input
          type="text"
          placeholder="Enter filter set name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyPress}
          autoFocus
          disabled={isLoading}
        />
        <div className={styles.modalActions}>
          <button onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={!name.trim() || isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SavedFilters = observer(() => {
  const { data: savedFilters = [], isLoading } = useSavedFilters();
  const createSavedFilter = useCreateSavedFilter();
  const deleteSavedFilter = useDeleteSavedFilter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isLoggedIn()) {
    return null;
  }

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
          source: selected.source,
          isOnSale: selected.isOnSale,
        },
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save filter:', error);
      // You might want to show a toast notification here
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>Saved Filters</h4>
        {hasActiveFilters() && (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={createSavedFilter.isPending}
            className={styles.saveButton}
          >
            Save Current Filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading saved filters...</div>
      ) : savedFilters.length === 0 ? (
        <div className={styles.empty}>
          No saved filters yet. {hasActiveFilters() && 'Save your current filters to get started!'}
        </div>
      ) : (
        <div className={styles.filterList}>
          {savedFilters.map((filter) => (
            <div key={filter.id} className={styles.filterItem}>
              <div className={styles.filterInfo}>
                <span className={styles.filterName}>{filter.name}</span>
                <span className={styles.filterDate}>
                  {new Date(filter.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.filterActions}>
                <button
                  onClick={() => handleLoadFilter(filter)}
                  className={styles.loadButton}
                >
                  Load
                </button>
                <button
                  onClick={() => handleDeleteFilter(filter.id)}
                  className={styles.deleteButton}
                  disabled={deleteSavedFilter.isPending}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SaveFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFilter}
        isLoading={createSavedFilter.isPending}
      />
    </div>
  );
});

export default SavedFilters; 