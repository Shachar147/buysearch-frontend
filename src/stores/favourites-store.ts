import { makeObservable, observable, action, runInAction } from 'mobx';
import { getFavourites, addToFavourite, removeFromFavourite } from '../services/favourites-api-service';

class FavouritesStore {
  favourites = new Set<number>();
  loading = false;

  constructor() {
    makeObservable(this, {
      favourites: observable,
      loading: observable,
      refreshFavourites: action,
      addFavourite: action,
      removeFavourite: action,
    });
    this.refreshFavourites();
  }

  isFavourite(productId: number) {
    return this.favourites.has(productId);
  }

  async refreshFavourites() {
    this.loading = true;
    try {
      const favs = await getFavourites();
      runInAction(() => {
        this.favourites = new Set((favs || []).map((f: any) => f.productId || f));
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async addFavourite(productId: number) {
    await addToFavourite(productId);
    runInAction(() => {
      this.favourites.add(productId);
    });
  }

  async removeFavourite(productId: number) {
    await removeFromFavourite(productId);
    runInAction(() => {
      this.favourites.delete(productId);
    });
  }
}

const favouritesStore = new FavouritesStore();
export default favouritesStore; 