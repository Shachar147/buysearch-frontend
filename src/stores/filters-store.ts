import { makeObservable, observable, action, reaction, toJS, computed } from 'mobx';
import { ParsedFilters } from '../services/search-api-service';
import _ from 'lodash';
import { DEFAULT_GENDER, DEFAULT_SORT_BY } from '../utils/consts';

// Add a type for price range options
export interface PriceRangeOption {
  label: string;
  value?: string;
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
    if (key === 'priceRange' && typeof value === 'object' && value !== null) {
      // Serialize priceRange as label:from-to
      const label = value.label ?? 'All';
      const from = value.from ?? '';
      const to = value.to ?? '';
      params.append('priceRange', `${label}:${from}-${to}`);
    } else if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== 'All' && v !== undefined && v !== null && v !== '') params.append(key, String(v));
      });
    } else {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export function queryStringToFilters(query: string): Record<string, string | string[] | { label: string; from?: number; to?: number }> {
  const params = new URLSearchParams(query);
  const filters: Record<string, string | string[] | { label: string; from?: number; to?: number }> = {};
  for (const [key, value] of params.entries()) {
    if (key === 'priceRange') {
      // Parse priceRange from label:from-to
      const match = value.match(/^([^:]+):([^\-]*)-([^\-]*)$/);
      if (match) {
        const label = match[1];
        const from = match[2] !== '' ? Number(match[2]) : undefined;
        const to = match[3] !== '' ? Number(match[3]) : undefined;
        const value = !from && !to ? 'All' : `${from ?? 0}-${to ?? (from < 2000 ? 2000 : 10000)}`;
        // @ts-ignore
        filters[key] = { label, from, to, value };
      } else {
        filters[key] = { label: value };
      }
    } else if (Object.prototype.hasOwnProperty.call(filters, key)) {
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
  priceRange: PriceRangeOption;
  gender: string;
  isFavourite: boolean;
  withPriceChange?: boolean;
  source?: string | string[];
  isOnSale?: boolean;
}

export class FiltersStore {
  // Data
  brands: any[] = [];
  menCategories: any[] = [];
  womenCategories: any[] = [];
  unisexCategories: any[] = [];
  colors: any[] = [];

  get categories() {
    switch (this.selected.gender?.toLowerCase()) {
      case 'men': return this.menCategories;
      case 'women': return this.womenCategories;
      case 'unisex': return this.unisexCategories;
      default: return this.menCategories;
    }
  }


  // todo: move these to a const file and re-use whenever needed
  selected: Filters = {
    search: '',
    sort: DEFAULT_SORT_BY,
    brand: ['All'],
    category: ['All'],
    color: ['All'],
    priceRange: { label: 'All', value: 'All' },
    gender: DEFAULT_GENDER,
    isFavourite: false,
    withPriceChange: false,
    source: ['All'],
    isOnSale: undefined,
  };

  // New properties for fallback search functionality
  originalSearch: string = '';
  isShowingFallbackResults: boolean = false;
  fallbackMessage: string = '';

  constructor() {
    makeObservable(this, {
      brands: observable,
      menCategories: observable,
      womenCategories: observable,
      unisexCategories: observable,
      colors: observable,
      selected: observable,
      originalSearch: observable,
      isShowingFallbackResults: observable,
      fallbackMessage: observable,
      setBrands: action,
      setMenCategories: action,
      setWomenCategories: action,
      setUnisexCategories: action,
      setColors: action,
      setFilter: action,
      setSearchFilter: action,
      setGender: action,
      applyParsedFilters: action,
      setOriginalSearch: action,
      setIsShowingFallbackResults: action,
      setFallbackMessage: action,
      clearFallbackState: action,
    });

    // Sync with URL hash
    reaction(
      () => toJS(this.selected),
      (selected) => {
        if (typeof window !== 'undefined') {
          const queryString = filtersToQueryString(selected);
          const newHash = queryString ? `#?${queryString}` : '';
          if (window.location.hash !== newHash) {
            window.location.hash = newHash;
          }
        }
      },
      { delay: 300 }
    );
  }

  setBrands = (brands: any[]) => {
    this.brands = brands;
  }

  setMenCategories = (categories: any[]) => {
    this.menCategories = categories;
  }

  setWomenCategories = (categories: any[]) => {
    this.womenCategories = categories;
  }

  setUnisexCategories = (categories: any[]) => {
    this.unisexCategories = categories;
  }

  setColors = (colors: any[]) => {
    this.colors = colors;
  }

  buildFilters() {
    const filters: any = {
      search: this.selected.search,
      sort: this.selected.sort,
      gender: this.selected.gender,
      isFavourite: this.selected.isFavourite,
      withPriceChange: this.selected.withPriceChange,
      isOnSale: this.selected.isOnSale,
    };
    // Handle brand
    if (Array.isArray(this.selected.brand)) {
      const brands = this.selected.brand.filter((b: string) => b !== 'All');
      if (brands.length > 0) filters.brand = brands.join(',');
    }
    // Handle category
    if (Array.isArray(this.selected.category)) {
      const categories = this.selected.category.filter((c: string) => c !== 'All');
      if (categories.length > 0) filters.category = categories.join(',');
    }
    // Handle color
    if (Array.isArray(this.selected.color)) {
      const colors = this.selected.color.filter((c: string) => c !== 'All');
      if (colors.length > 0) filters.color = colors.join(',');
    }
    // Handle source
    if (Array.isArray(this.selected.source)) {
      const sources = this.selected.source.filter((s: string) => s !== 'All');
      if (sources.length > 0) filters.source = sources.join(',');
    }
    // Handle priceRange
    filters.priceFrom = typeof this.selected.priceRange === 'object' && 'from' in this.selected.priceRange ? this.selected.priceRange.from : undefined;
    filters.priceTo = typeof this.selected.priceRange === 'object' && 'to' in this.selected.priceRange ? this.selected.priceRange.to : undefined;
    // Handle isFavourite
    if (this.selected.isFavourite) filters.isFavourite = true;
    // Handle withPriceChange
    if (this.selected.withPriceChange) filters.withPriceChange = true;
    return filters;
  }

  applyParsedFilters = (filters: ParsedFilters | null) => {
    if (filters && (
      filters.colors.length ||
      filters.categories.length ||
      filters.brands.length ||
      filters.maxPrice !== null ||
      filters.minPrice !== null ||
      filters.gender || 
      filters.sources.length ||
      filters.isOnSale
    )) {
      // Apply parsed filters
      this.selected.color = filters.colors.length ? filters.colors : ['All'];
      this.selected.category = filters.categories.length ? filters.categories : ['All'];
      this.selected.brand = filters.brands.length ? filters.brands : ['All'];
      const priceRange = getPriceRangeOption(filters.minPrice, filters.maxPrice);
      if (priceRange.label === 'Custom' || priceRange.label.startsWith('Custom')) {
        // Only set a custom label if the range is not a built-in option
        const min = filters.minPrice === null ? 0 : filters.minPrice;
        const max = filters.maxPrice === null ? min < 2000 ? 2000 : 10000 : filters.maxPrice;
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
      this.selected.source = filters.sources && filters.sources.length ? filters.sources : ['All'];
      if (filters.isOnSale) this.selected.isOnSale = filters.isOnSale;
    }
    // Always trigger search
    this.setSearchFilter(this.selected.search);
  }

  // New methods for fallback search functionality
  setOriginalSearch = (search: string) => {
    this.originalSearch = search;
  }

  setIsShowingFallbackResults = (isShowing: boolean) => {
    this.isShowingFallbackResults = isShowing;
  }

  setFallbackMessage = (message: string) => {
    this.fallbackMessage = message;
  }

  clearFallbackState = () => {
    this.originalSearch = '';
    this.isShowingFallbackResults = false;
    this.fallbackMessage = '';
  }

  // Method to check if we have other filters besides search
  hasOtherFilters = () => {
    return (
      (Array.isArray(this.selected.brand) && this.selected.brand.some(b => b !== 'All')) ||
      (Array.isArray(this.selected.category) && this.selected.category.some(c => c !== 'All')) ||
      (Array.isArray(this.selected.color) && this.selected.color.some(c => c !== 'All')) ||
      (Array.isArray(this.selected.source) && this.selected.source.some(s => s !== 'All')) ||
      (this.selected.priceRange && this.selected.priceRange.label !== 'All') ||
      this.selected.isFavourite ||
      this.selected.withPriceChange ||
      this.selected.isOnSale
    );
  }

  eligibleForFallbackSearch = () => {
    return this.selected.search && this.hasOtherFilters();
  }

  // Method to trigger fallback search (remove search keywords)
  triggerFallbackSearch = () => {
    if (this.eligibleForFallbackSearch()) {
      this.setOriginalSearch(this.selected.search);
      this.setSearchFilter('');
      this.setIsShowingFallbackResults(true);
      this.setFallbackMessage(`We couldn't find exact results for "${this.originalSearch}". showing items that match your filters instead.`);
    }
  }

  debouncedSearch = _.debounce((value) => {
    void this.setSearchFilter(value)
  }, 300);

  setFilter = (key: keyof Filters, value: any) => {
    if (key === 'search') {
      // Clear fallback state when user starts a new search
      this.clearFallbackState();
      // Update originalSearch to the new search value
      this.setOriginalSearch(value);
      // this.selected.search = value;
      this.debouncedSearch(value);
    } else {
      if (['category', 'color', 'brand', 'source'].includes(key)) {
        (this.selected as any)[key] = Array.isArray(value) ? value : [value];
      } else {
        (this.selected as any)[key] = value;
      }
    }
  }

  setSearchFilter = (value: any) => {
    this.selected.search = value;
  }

  setGender = (gender: string) => {
    this.selected.gender = gender;
  }
}

const filtersStore = new FiltersStore();
export default filtersStore; 