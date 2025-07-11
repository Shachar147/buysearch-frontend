import { useMutation } from '@tanstack/react-query';
import { addToFavourite, removeFromFavourite } from '../../services/favourites-api-service';

export function useAddToFavourite() {
  return useMutation({
    mutationFn: (productId: number) => addToFavourite(productId),
  });
}

export function useRemoveFromFavourite() {
  return useMutation({
    mutationFn: (productId: number) => removeFromFavourite(productId),
  });
} 