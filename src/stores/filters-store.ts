import { makeObservable, observable, action, runInAction, reaction, toJS, computed } from 'mobx';
import { fetchAllBrands } from '../services/brand-api-service';
import { fetchAllCategories } from '../services/category-api-service';
import { fetchAllColors } from '../services/color-api-service';
import { parseSearchQuery } from '../services/search-api-service';
import productStore from './product-store';
import _ from 'lodash';

// Add a type for price range options
export interface PriceRangeOption {
  label: string;
  value: string;
  from?: number;
  to?: number;
}

export const priceRangeOptions: PriceRangeOption[] = [
  { label: 'All', value: 'All' },
  { label: 'Up to 100 ILS', value: 'Up to 100 ILS', to: 100 },
  { label: '100-150 ILS', value: '100-150 ILS', from: 100, to: 150 },
  { label: '151-200 ILS', value: '151-200 ILS', from: 151, to: 200 },
  { label: '201-300 ILS', value: '201-300 ILS', from: 201, to: 300 },
  { label: '301-600 ILS', value: '301-600 ILS', from: 301, to: 600 },
  { label: '601-1000 ILS', value: '601-1000 ILS', from: 601, to: 1000 },
  { label: '1000+ ILS', value: '1000+ ILS', from: 1001 },
  { label: 'Custom', value: 'Custom' },
];

export function getPriceRangeOption(minPrice: number | null, maxPrice: number | null) {
  for (const option of priceRangeOptions) {
    if (option.label === 'All') {
      if (minPrice === null && maxPrice === null) return option;
      continue;
    }
    if (
      (option.from === undefined || option.from === minPrice) &&
      (option.to === undefined || option.to === maxPrice)
    ) {
      return option;
    }
  }
  return { label: 'Custom', from: minPrice, to: maxPrice };
}

// --- URL hash sync helpers ---
export function filtersToQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'All' || (Array.isArray(value) && value.length === 0)) return;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== 'All' && v !== undefined && v !== null && v !== '') params.append(key, String(v));
      });
    } else {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export function queryStringToFilters(query: string): Record<string, string | string[]> {
  const params = new URLSearchParams(query);
  const filters: Record<string, string | string[]> = {};
  for (const [key, value] of params.entries()) {
    if (Object.prototype.hasOwnProperty.call(filters, key)) {
      if (Array.isArray(filters[key])) {
        filters[key] = [...(filters[key] as string[]), value];
      } else {
        filters[key] = [filters[key] as string, value];
      }
    } else {
      filters[key] = value;
    }
  }
  return filters;
}
// --- end URL hash sync helpers ---

export interface Filters {
  search: string;
  sort: string;
  brand: string | string[];
  category: string | string[];
  color: string | string[];
  priceRange: { label: string; from?: number; to?: number };
  gender: string;
  isFavourite: boolean;
}

export class FiltersStore {
  brands: any[] = [];
  menCategories: any[] = [];
  womenCategories: any[] = [];
  get categories() {
    return this.selected.gender?.toLowerCase() === 'men' ? this.menCategories : this.womenCategories;
  }
  colors: any[] = [];
  loading = false;

  // todo: move these to a const file and re-use whenever needed
  selected: Filters = {
    search: '',
    sort: 'Relevance',
    brand: 'All',
    category: 'All',
    color: 'All',
    priceRange: { label: 'All' },
    gender: 'men',
    isFavourite: false,
  };

  constructor() {
    makeObservable(this, {
      brands: observable,
      menCategories: observable,
      womenCategories: observable,
      categories: computed,
      colors: observable,
      loading: observable,
      selected: observable,
      loadAll: action,
      setFilter: action,
    });

    this.loadAll();

    // Immediate reaction for other filters
    reaction(
      () => [this.selected.sort, this.selected.brand, this.selected.category, this.selected.color],
      () => {
        const filters = this.buildFilters();
        productStore.reset(filters);
        productStore.loadMore(filters);
      }
    );

    reaction(
      () => [toJS(this.selected.priceRange)],
      () => {
        this.debouncedFilterChange();
      }
    )
  }

  buildFilters() {
    const selected = this.selected;
    const filters: any = {
      search: selected.search,
      sort: selected.sort,
      gender: selected.gender,
    };
    // Handle brand
    if (Array.isArray(selected.brand)) {
      const brands = selected.brand.filter((b: string) => b !== 'All');
      if (brands.length > 0) filters.brand = brands.join(',');
    } else if (selected.brand !== 'All') {
      filters.brand = selected.brand;
    }
    // Handle category
    if (Array.isArray(selected.category)) {
      const categories = selected.category.filter((c: string) => c !== 'All');
      if (categories.length > 0) filters.category = categories.join(',');
    } else if (selected.category !== 'All') {
      filters.category = selected.category;
    }
    // Handle color
    if (Array.isArray(selected.color)) {
      const colors = selected.color.filter((c: string) => c !== 'All');
      if (colors.length > 0) filters.color = colors.join(',');
    } else if (selected.color !== 'All') {
      filters.color = selected.color;
    }
    // Handle priceRange
    filters.priceFrom = typeof selected.priceRange === 'object' && 'from' in selected.priceRange ? selected.priceRange.from : undefined;
    filters.priceTo = typeof selected.priceRange === 'object' && 'to' in selected.priceRange ? selected.priceRange.to : undefined;
    // Handle isFavourite
    if (selected.isFavourite) filters.isFavourite = true;
    return filters;
  }

  async loadAll() {
    this.loading = true;
    try {
      const [brands, menCategories, womenCategories, colors] = await Promise.all([
        fetchAllBrands(),
        fetchAllCategories('men'),
        fetchAllCategories('women'),
        fetchAllColors(),
      ]);
      runInAction(() => {
        const brandNamesAliases = ['abercrombie and fitch', 'ellesse'];
        const brandNames = new Set(brands.map((b: any) => b.name?.toLowerCase?.() || b?.toLowerCase?.()));
        this.brands = brands;
        this.menCategories = menCategories.filter((c: any) => !brandNames.has(c.name?.toLowerCase() || c?.toLowerCase?.()) && !brandNamesAliases.includes(c.name?.toLowerCase?.()));
        this.womenCategories = womenCategories.filter((c: any) => !brandNames.has(c.name?.toLowerCase() || c?.toLowerCase?.()) && !brandNamesAliases.includes(c.name?.toLowerCase?.()));
        this.colors = colors;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  setSearchFilter = async (value: any) => {  
    this.selected.search = value;
    const filters = await parseSearchQuery(value);
    if (filters && (
      filters.colors.length ||
      filters.categories.length ||
      filters.brands.length ||
      filters.maxPrice !== null ||
      filters.minPrice !== null ||
      filters.gender
    )) {
      // Apply parsed filters
      this.selected.color = filters.colors.length ? filters.colors.join(',') : 'All';
      this.selected.category = filters.categories.length ? filters.categories.join(',') : 'All';
      this.selected.brand = filters.brands.length ? filters.brands.join(',') : 'All';
      const priceRange = getPriceRangeOption(filters.minPrice, filters.maxPrice);
      if (priceRange.label === 'Custom' || priceRange.label.startsWith('Custom')) {
        // Only set a custom label if the range is not a built-in option
        const min = filters.minPrice === null ? 0 : filters.minPrice;
        const max = filters.maxPrice === null ? 2000 : filters.maxPrice;
        if (!priceRangeOptions.some(opt => opt.from === min && opt.to === max)) {
          const customRange: PriceRangeOption = {
            label: `Custom: ${min} - ${max} ILS`,
            value: 'Custom',
            from: min,
            to: max,
          };
          this.selected.priceRange = customRange;
        } else {
          // Use the default 'Custom' label
          this.selected.priceRange = priceRangeOptions.find(opt => opt.value === 'Custom') || priceRange;
        }
      } else {
        this.selected.priceRange = priceRange;
      }
      if (filters.gender) this.selected.gender = filters.gender.toLowerCase();
    }
    // Always trigger search
    this.debouncedFilterChange();
  }

  debouncedSearch = _.debounce((value) => {
    void this.setSearchFilter(value)
  }, 300);

  debouncedFilterChange = _.debounce(() => {
    const filters = this.buildFilters();
    productStore.reset(filters);
    productStore.loadMore(filters);
  }, 600);

  setFilter = async (key: keyof typeof this.selected, value: any) => {
    if (key === 'search') {
      this.selected.search = value;
      this.debouncedSearch(value);
    } else {
      this.selected[key] = value;
    }
  }

  setGender = (gender: string) => {
    this.selected.gender = gender;
    const filters = this.buildFilters();
    productStore.reset(filters);
    productStore.loadMore(filters);
  }
}

const filtersStore = new FiltersStore();
export default filtersStore; 