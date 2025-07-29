import { useQuery } from '@tanstack/react-query';
import {
  fetchSavedFilters,
  fetchSavedFilterById,
} from '../../services/saved-filters-api-service';

export const SAVED_FILTERS_QUERY_KEY = 'saved-filters';

export function useSavedFilters() {
  return useQuery({
    queryKey: [SAVED_FILTERS_QUERY_KEY],
    queryFn: fetchSavedFilters,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useSavedFilter(id: number) {
  return useQuery({
    queryKey: [SAVED_FILTERS_QUERY_KEY, id],
    queryFn: () => fetchSavedFilterById(id),
    enabled: !!id,
  });
} 