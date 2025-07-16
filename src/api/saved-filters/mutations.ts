import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSavedFilter,
  updateSavedFilter,
  deleteSavedFilter,
  type CreateSavedFilterRequest,
  type UpdateSavedFilterRequest,
  type SavedFilter,
} from '../../services/saved-filters-api-service';
import { SAVED_FILTERS_QUERY_KEY } from './queries';
import api from '../../services/axios-instance';
import { API_BASE_URL } from '../../utils/config';

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

export function useUpdateSavedFilterLastUsed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`${API_BASE_URL}/saved-filters/${id}/last-used`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVED_FILTERS_QUERY_KEY] });
    },
  });
} 