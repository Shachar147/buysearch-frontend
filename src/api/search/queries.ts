import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { parseSearchQuery } from '../../services/search-api-service';

export function useParsedSearchQuery(
  query: string,
  options?: UseQueryOptions<any, any, any, [string, string]>
) {
  return useQuery({
    queryKey: ['parsedSearchQuery', query],
    queryFn: () => parseSearchQuery(query),
    enabled: !!query,
    ...options,
  });
} 