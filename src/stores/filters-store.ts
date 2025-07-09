import { makeObservable, observable, action, runInAction, reaction, toJS, computed } from 'mobx';
import { fetchAllBrands } from '../services/brand-api-service';
import { fetchAllCategories } from '../services/category-api-service';
import { fetchAllColors } from '../services/color-api-service';
import { parseSearchQuery } from '../services/search-api-service';
import productStore from './product-store';
import _ from 'lodash';

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
  selected = {
    search: '',
    sort: 'Relevance',
    brand: 'All',
    category: 'All',
    color: 'All',
    priceRange: { label: 'All' },
    gender: 'men',
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

    // // Debounced reaction for search
    // reaction(
    //   () => this.selected.search,
    //   debounce((search) => {
    //     const filters = this.buildFilters();
    //     productStore.reset(filters);
    //     productStore.loadMore(filters);
    //   }, 400)
    // );

    // Immediate reaction for other filters
    reaction(
      () => [this.selected.sort, this.selected.brand, this.selected.category, this.selected.color, toJS(this.selected.priceRange)],
      () => {
        const filters = this.buildFilters();
        productStore.reset(filters);
        productStore.loadMore(filters);
      }
    );
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
    if (Array.isArray(selected.priceRange)) {
      const ranges = selected.priceRange.filter((p: any) => p !== 'All');
      if (ranges.length > 0) filters.priceRange = ranges.join(',');
    } else if (selected.priceRange && (typeof selected.priceRange === 'object')) {
      const value = 'value' in selected.priceRange ? selected.priceRange.value : selected.priceRange.label;
      if (value !== 'All') {
        filters.priceRange = value;
      }
    }
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
      if (filters.maxPrice !== null || filters.minPrice !== null) {
        this.selected.priceRange = { label: 'Custom' };
      } else {
        this.selected.priceRange = { label: 'All' };
      }
      if (filters.gender) this.selected.gender = filters.gender.toLowerCase();
    }
  }

  debouncedSearch = _.debounce((value) => {
    void this.setSearchFilter(value)
  }, 300);

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