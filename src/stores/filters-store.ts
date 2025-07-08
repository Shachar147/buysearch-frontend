import { makeObservable, observable, action, runInAction, reaction, toJS } from 'mobx';
import { fetchAllBrands } from '../services/brand-api-service';
import { fetchAllCategories } from '../services/category-api-service';
import { fetchAllColors } from '../services/color-api-service';
import productStore from './product-store';

export class FiltersStore {
  brands: any[] = [];
  categories: any[] = [];
  colors: any[] = [];
  loading = false;

  selected = {
    search: '',
    sort: 'Relevance',
    brand: 'All',
    category: 'All',
    color: 'All',
    priceRange: { label: 'All' },
  };

  constructor() {
    makeObservable(this, {
      brands: observable,
      categories: observable,
      colors: observable,
      loading: observable,
      selected: observable,
      loadAll: action,
      setFilter: action,
    });
    
    this.loadAll();
    reaction(
      () => ({ ...this.selected }),
      (selected) => {
        // Build filters object for API
        const filters: any = {
          search: selected.search,
          sort: selected.sort,
          brand: selected.brand !== 'All' ? selected.brand : undefined,
          category: selected.category !== 'All' ? selected.category : undefined,
          color: selected.color !== 'All' ? selected.color : undefined,
        };
        if (selected.priceRange && selected.priceRange.label !== 'All') {
            const pr = toJS(selected.priceRange) as { from?: number; to?: number; label: string };
          if (typeof pr.from === 'number') {
            filters.priceFrom = pr.from;
          }
          if (typeof pr.to === 'number') {
            filters.priceTo = pr.to;
          }
        }
        console.log({ selected });
        productStore.reset(filters);
        productStore.loadMore(filters);
      }
    );
  }

  async loadAll() {
    this.loading = true;
    try {
      const [brands, categories, colors] = await Promise.all([
        fetchAllBrands(),
        fetchAllCategories(),
        fetchAllColors(),
      ]);
      runInAction(() => {
        this.brands = brands;
        this.categories = categories;
        this.colors = colors;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  setFilter = (key: keyof typeof this.selected, value: any) => {
    this.selected[key] = value;
  }
}

const filtersStore = new FiltersStore();
export default filtersStore; 