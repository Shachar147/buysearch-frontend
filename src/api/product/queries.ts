import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchProductsByIds, fetchPriceHistory, fetchBulkPriceHistory, ProductFilters, ProductApi, ProductApiResponse } from '../../services/product-api-service';

export function useProducts(offset = 0, limit = 20, filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', offset, limit, filters],
    queryFn: () => fetchProducts(offset, limit, filters),
  });
}

export function useProductsByIds(ids: number[]) {
  return useQuery({
    queryKey: ['productsByIds', ids],
    queryFn: () => fetchProductsByIds(ids),
    enabled: ids.length > 0,
  });
}

export function usePriceHistory(productId: number, limit = 5) {
  return useQuery({
    queryKey: ['priceHistory', productId, limit],
    queryFn: () => fetchPriceHistory(productId, limit),
    enabled: !!productId,
  });
}

export function useBulkPriceHistory(productIds: number[], limit = 5) {
  return useQuery({
    queryKey: ['bulkPriceHistory', productIds, limit],
    queryFn: () => fetchBulkPriceHistory(productIds, limit),
    enabled: productIds.length > 0,
  });
} 