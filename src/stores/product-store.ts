import { makeAutoObservable, runInAction } from 'mobx';
import { fetchProducts, ProductApi, ProductFilters } from '../services/product-api-service';

export class ProductStore {
  products: ProductApi[] = [];
  loading = false;
  hasNextPage = true;
  offset = 0;
  limit = 20;
  total = 0;
  lastFilters: ProductFilters = {};

  constructor() {
    makeAutoObservable(this);
  }

  async loadMore(filters: ProductFilters = this.lastFilters) {
    if (this.loading || !this.hasNextPage) return;
    this.loading = true;
    try {
      const res = await fetchProducts(this.offset, this.limit, filters);
      runInAction(() => {
        this.products = [...this.products, ...res.data];
        this.offset += res.data.length;
        this.hasNextPage = res.hasNextPage;
        this.total = res.total;
        this.lastFilters = filters;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  reset(filters: ProductFilters = this.lastFilters) {
    this.products = [];
    this.offset = 0;
    this.hasNextPage = true;
    this.total = 0;
    this.lastFilters = filters;
  }
}

const productStore = new ProductStore();
export default productStore; 