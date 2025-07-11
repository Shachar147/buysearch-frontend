import { useQuery } from '@tanstack/react-query';
import { getFavourites, isFavourite } from '../../services/favourites-api-service';

export function useFavourites() {
  return useQuery({
    queryKey: ['favourites'],
    queryFn: getFavourites,
  });
}

export function useIsFavourite(productId: number) {
  return useQuery({
    queryKey: ['isFavourite', productId],
    queryFn: () => isFavourite(productId),
    enabled: !!productId,
  });
} 