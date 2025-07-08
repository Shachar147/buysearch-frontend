import { makeObservable, observable, action, runInAction, reaction } from 'mobx';
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
    priceRange: 'All',
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
      () => {
        productStore.reset();
        // You may want to pass filters to fetchProducts here
        productStore.loadMore();
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

  setFilter = (key: keyof typeof this.selected, value: string) => {
    this.selected[key] = value;
  }
}

const filtersStore = new FiltersStore();
export default filtersStore; 