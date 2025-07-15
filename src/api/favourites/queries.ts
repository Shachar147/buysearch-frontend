import { useQuery } from '@tanstack/react-query';
import { getFavourites, isFavourite } from '../../services/favourites-api-service';

export function useFavourites() {
  return useQuery({
    queryKey: ['favourites'],
    queryFn: getFavourites,
    staleTime: 1000 * 60 * 5, // 5 minutes, adjust as needed
    cacheTime: 1000 * 60 * 30, // 30 minutes, adjust as needed
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

export function useIsFavourite(productId: number) {
  return useQuery({
    queryKey: ['isFavourite', productId],
    queryFn: () => isFavourite(productId),
    enabled: !!productId,
  });
} 