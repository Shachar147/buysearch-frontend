import { useQuery } from '@tanstack/react-query';
import { fetchAllColors, fetchColorById } from '../../services/color-api-service';

export function useAllColors() {
  return useQuery({
    queryKey: ['colors'],
    queryFn: fetchAllColors,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // to reload
  });
}

export function useColorById(id: string) {
  return useQuery({
    queryKey: ['color', id],
    queryFn: () => fetchColorById(id),
    enabled: !!id,
  });
} 