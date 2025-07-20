import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchProducts, ProductFilters, ProductApiResponse } from '../../services/product-api-service';

// Helper to serialize priceRange for query key
function serializePriceRange(priceRange: { label: string; from?: number; to?: number }) {
if (!priceRange || priceRange.label == undefined || priceRange.label == 'All') return 'All';
return `${priceRange.label}:${priceRange.from ?? ''}-${priceRange.to ?? ''}`;
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
    queryFn: ({ pageParam = 0 }) => fetchProducts(pageParam as number, limit, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.offset + lastPage.data.length;
      }
      return undefined;
    },
    staleTime: 1000 * 60, // 5 minutes, adjust as needed
    // @ts-ignore
    cacheTime: 1000 * 60 * 30, // 30 minutes, adjust as needed
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
} 