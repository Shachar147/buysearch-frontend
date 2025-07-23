import { useQuery } from '@tanstack/react-query';
import { getAllUsers, getSourceStats, getCategoryStats, getBrandStats, getTotalProducts } from '../../services/auth-api-service';

export function useAllUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });
}

export function useSourceStatsQuery() {
  return useQuery({
    queryKey: ['sourceStats'],
    queryFn: getSourceStats,
  });
}

export function useCategoryStatsQuery() {
  return useQuery({
    queryKey: ['categoryStats'],
    queryFn: getCategoryStats,
  });
}

export function useBrandStatsQuery() {
  return useQuery({
    queryKey: ['brandStats'],
    queryFn: getBrandStats,
  });
}

export function useTotalProductsQuery() {
  return useQuery({
    queryKey: ['totalProducts'],
    queryFn: getTotalProducts,
  });
} 