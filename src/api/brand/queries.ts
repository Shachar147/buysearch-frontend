import { useQuery } from '@tanstack/react-query';
import { fetchAllBrands, fetchBrandById } from '../../services/brand-api-service';

export function useAllBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchAllBrands,
  });
}

export function useBrandById(id: string) {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: () => fetchBrandById(id),
    enabled: !!id,
  });
} 