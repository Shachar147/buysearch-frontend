import { useQuery } from '@tanstack/react-query';
import { fetchAllSources, fetchSourceById } from '../../services/source-api-service';

export function useAllSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: fetchAllSources,
  });
}

export function useSourceById(id: string) {
  return useQuery({
    queryKey: ['source', id],
    queryFn: () => fetchSourceById(id),
    enabled: !!id,
  });
} 