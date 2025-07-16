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

export function useCreateSavedFilter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSavedFilterRequest) => createSavedFilter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVED_FILTERS_QUERY_KEY] });
    },
  });
}

export function useUpdateSavedFilter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSavedFilterRequest }) =>
      updateSavedFilter(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [SAVED_FILTERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SAVED_FILTERS_QUERY_KEY, id] });
    },
  });
}

export function useDeleteSavedFilter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deleteSavedFilter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVED_FILTERS_QUERY_KEY] });
    },
  });
} 