import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../../services/auth-api-service';

export function useAllUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });
} 