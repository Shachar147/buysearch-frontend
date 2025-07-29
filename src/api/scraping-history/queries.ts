import { useQuery } from '@tanstack/react-query';
import { getScrapingHistorySummary } from '../../services/scraping-history-api-service';

export function useScrapingHistorySummaryQuery(options = {}) {
  return useQuery({
    queryKey: ['scraping-history-summary'],
    queryFn: getScrapingHistorySummary,
    // staleTime: 2 * 60 * 1000, // 2 minutes
    // gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // to reload
    ...options, 
  });
} 