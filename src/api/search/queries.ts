import { useQuery } from '@tanstack/react-query';
import { parseSearchQuery } from '../../services/search-api-service';

export function useParsedSearchQuery(query: string) {
  return useQuery({
    queryKey: ['parsedSearchQuery', query],
    queryFn: () => parseSearchQuery(query),
    enabled: !!query,
  });
} 