import { makeAutoObservable, runInAction } from 'mobx';
import { fetchProducts, ProductApi } from '../services/product-service';

export class ProductStore {
  products: ProductApi[] = [];
  loading = false;
  hasNextPage = true;
  offset = 0;
  limit = 20;
  total = 0;

  constructor() {
    makeAutoObservable(this);
  }

  async loadMore() {
    if (this.loading || !this.hasNextPage) return;
    this.loading = true;
    try {
      const res = await fetchProducts(this.offset, this.limit);
      runInAction(() => {
        this.products = [...this.products, ...res.data];
        this.offset += res.data.length;
        this.hasNextPage = res.hasNextPage;
        this.total = res.total;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  reset() {
    this.products = [];
    this.offset = 0;
    this.hasNextPage = true;
    this.total = 0;
  }
}

const productStore = new ProductStore();
export default productStore; 