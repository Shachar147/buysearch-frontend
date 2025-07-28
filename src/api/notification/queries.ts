import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnseenCount, markAsSeen, markAllAsSeen } from '../../services/notification-api-service';

export const useNotificationsQuery = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => getNotifications(page, limit),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every 1 minute
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

export const useUnseenCountQuery = () => {
  return useQuery({
    queryKey: ['notifications', 'unseen-count'],
    queryFn: getUnseenCount,
    staleTime: 120000,           // 2 minute (data considered fresh for 1 minute)
    refetchInterval: 120000,     // Re-fetch every 2 minute
    refetchOnWindowFocus: true, // Also refetch when window is refocused
  });
};

export const useMarkAsSeenMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAsSeen,
    onSuccess: () => {
      // Invalidate and refetch notifications and unseen count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsSeenMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllAsSeen,
    onSuccess: () => {
      // Invalidate and refetch notifications and unseen count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}; 