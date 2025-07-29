import { useQuery } from '@tanstack/react-query';
import { getAllUsers, getSourceStats, getCategoryStats, getBrandStats, getTotalProducts, getDailyStats } from '../../services/auth-api-service';

export function useAllUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    // Admin data doesn't change frequently, cache for longer
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes,
    refetchOnWindowFocus: false,
  });
}

export function useSourceStatsQuery() {
  return useQuery({
    queryKey: ['sourceStats'],
    queryFn: getSourceStats,
    // Stats data doesn't change frequently, cache for longer
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCategoryStatsQuery() {
  return useQuery({
    queryKey: ['categoryStats'],
    queryFn: getCategoryStats,
    // Stats data doesn't change frequently, cache for longer
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

export function useBrandStatsQuery() {
  return useQuery({
    queryKey: ['brandStats'],
    queryFn: getBrandStats,
    // Stats data doesn't change frequently, cache for longer
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

export function useTotalProductsQuery() {
  return useQuery({
    queryKey: ['totalProducts'],
    queryFn: getTotalProducts,
    // Product count changes more frequently, shorter cache
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useDailyStatsQuery() {
  return useQuery({
    queryKey: ['dailyStats'],
    queryFn: getDailyStats,
    // Daily stats change daily, cache for longer
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
} 