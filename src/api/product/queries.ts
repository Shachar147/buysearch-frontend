import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchProducts, fetchProductsByIds, fetchPriceHistory, fetchBulkPriceHistory, ProductFilters, ProductApi, ProductApiResponse } from '../../services/product-api-service';

// Helper to serialize priceRange for query key
function serializePriceRange(priceRange: { label: string; from?: number; to?: number }) {
if (!priceRange || priceRange.label == undefined || priceRange.label == 'All') return 'All';
return `${priceRange.label}:${priceRange.from ?? ''}-${priceRange.to ?? ''}`;
}

export function useProducts(offset = 0, limit = 20, filters: ProductFilters = {}) {
  return useQuery({
    queryKey: [
      'products',
      offset,
      limit,
      {
        ...filters,
        priceRange: serializePriceRange(filters.priceRange),
      }
    ],
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



export function useInfiniteProducts(filters: ProductFilters = {}, limit = 20) {
  return useInfiniteQuery<ProductApiResponse, Error>({
    queryKey: [
      'products',
      {
        ...filters,
        priceRange: serializePriceRange(filters.priceRange),
      },
      limit,
    ],
    queryFn: ({ pageParam = 0 }) => fetchProducts(pageParam, limit, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.offset + lastPage.data.length;
      }
      return undefined;
    },
  });
} 