import { useQuery } from '@tanstack/react-query';
import { fetchAllColors, fetchColorById } from '../../services/color-api-service';

export function useAllColors() {
  return useQuery({
    queryKey: ['colors'],
    queryFn: fetchAllColors,
  });
}

export function useColorById(id: string) {
  return useQuery({
    queryKey: ['color', id],
    queryFn: () => fetchColorById(id),
    enabled: !!id,
  });
} 