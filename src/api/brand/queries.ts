import { useQuery } from '@tanstack/react-query';
import { fetchAllBrands, fetchBrandById } from '../../services/brand-api-service';

export function useAllBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchAllBrands,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useBrandById(id: string) {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: () => fetchBrandById(id),
    enabled: !!id,
  });
} 