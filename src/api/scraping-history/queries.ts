import { useQuery } from '@tanstack/react-query';
import { getScrapingHistorySummary } from '../../services/scraping-history-api-service';

export function useScrapingHistorySummaryQuery(options = {}) {
  return useQuery({
    queryKey: ['scraping-history-summary'],
    queryFn: getScrapingHistorySummary,
    staleTime: 60000, // 1 minute
    ...options,
  });
} 