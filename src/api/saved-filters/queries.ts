import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSavedFilters,
  fetchSavedFilterById,
  createSavedFilter,
  updateSavedFilter,
  deleteSavedFilter,
  type SavedFilter,
  type CreateSavedFilterRequest,
  type UpdateSavedFilterRequest,
} from '../../services/saved-filters-api-service';

export const SAVED_FILTERS_QUERY_KEY = 'saved-filters';

export function useSavedFilters() {
  return useQuery({
    queryKey: [SAVED_FILTERS_QUERY_KEY],
    queryFn: fetchSavedFilters,
  });
}

export function useSavedFilter(id: number) {
  return useQuery({
    queryKey: [SAVED_FILTERS_QUERY_KEY, id],
    queryFn: () => fetchSavedFilterById(id),
    enabled: !!id,
  });
} 