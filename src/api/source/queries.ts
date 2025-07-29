import { useQuery } from '@tanstack/react-query';
import { fetchAllSources, fetchSourceById } from '../../services/source-api-service';

export function useAllSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: fetchAllSources,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useSourceById(id: string) {
  return useQuery({
    queryKey: ['source', id],
    queryFn: () => fetchSourceById(id),
    enabled: !!id,
  });
} 