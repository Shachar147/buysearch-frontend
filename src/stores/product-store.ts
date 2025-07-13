import { useProducts, useBulkPriceHistory } from '../api/product/queries';
import { ProductFilters } from '../services/product-api-service';

// Custom hook to get products and price history using React Query
export function useProductStore(offset = 0, limit = 20, filters: ProductFilters = {}) {
  const productsQuery = useProducts(offset, limit, filters);
  const productIds = productsQuery.data?.data.map((p: any) => p.id) || [];
  const priceHistoryQuery = useBulkPriceHistory(productIds, 5);
  return {
    products: productsQuery.data?.data || [],
    loading: productsQuery.isLoading,
    hasNextPage: productsQuery.data?.hasNextPage || false,
    offset,
    limit,
    total: productsQuery.data?.total || 0,
    priceHistoryMap: priceHistoryQuery.data || {},
    ...productsQuery,
  };
} 