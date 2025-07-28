import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnseenCount, markAsSeen, markAllAsSeen } from '../../services/notification-api-service';

export const useNotificationsQuery = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => getNotifications(page, limit),
    staleTime: 30000, // 30 seconds
  });
};

export const useUnseenCountQuery = () => {
  return useQuery({
    queryKey: ['notifications', 'unseen-count'],
    queryFn: getUnseenCount,
    staleTime: 60000, // 1 minute
    refetchInterval: false, // Disable auto-refetch
    refetchOnWindowFocus: true,
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