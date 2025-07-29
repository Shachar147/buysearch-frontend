import { useQuery } from '@tanstack/react-query';
import { fetchAllCategories, fetchCategoryById } from '../../services/category-api-service';

export function useAllCategories(gender: string) {
  return useQuery({
    queryKey: ['categories', gender],
    queryFn: () => fetchAllCategories(gender),
    enabled: !!gender,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCategoryById(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => fetchCategoryById(id),
    enabled: !!id,
  });
} 