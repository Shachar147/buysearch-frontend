import { makeAutoObservable, runInAction } from 'mobx';
import { fetchProducts, ProductApi, ProductFilters, fetchBulkPriceHistory } from '../services/product-api-service';

export class ProductStore {
  products: ProductApi[] = [];
  loading = false;
  hasNextPage = true;
  offset = 0;
  limit = 20;
  total = 0;
  lastFilters: ProductFilters = {};
  priceHistoryMap: Record<number, { price: number; date: string }[]> = {};

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
      // Fetch price history for new products
      await this.fetchPriceHistoryForCurrentProducts();
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async fetchPriceHistoryForCurrentProducts(limit = 5) {
    const allIds = this.products.map(p => p.id).filter(Boolean);
    const missingIds = allIds.filter(id => !(id in this.priceHistoryMap));
    if (missingIds.length === 0) return;
    const newMap = await fetchBulkPriceHistory(missingIds, limit);
    runInAction(() => {
      this.priceHistoryMap = { ...this.priceHistoryMap, ...newMap };
    });
  }

  reset(filters: ProductFilters = this.lastFilters) {
    this.products = [];
    this.offset = 0;
    this.hasNextPage = true;
    this.total = 0;
    this.lastFilters = filters;
    this.priceHistoryMap = {};
  }
}

const productStore = new ProductStore();
export default productStore; 