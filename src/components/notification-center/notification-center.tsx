"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useNotificationsQuery, useUnseenCountQuery, useMarkAsSeenMutation, useMarkAllAsSeenMutation } from '../../api/notification/queries';
import { useRouter } from 'next/navigation';
import styles from './notification-center.module.css';
import getClasses from '../../utils/get-classes';

interface NotificationCenterProps {
  className?: string;
  scrolled?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className, scrolled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const { data: unseenCountData, refetch: refetchUnseenCount } = useUnseenCountQuery();
  const { data: notificationsData, isLoading } = useNotificationsQuery(currentPage, 10);
  const markAsSeenMutation = useMarkAsSeenMutation();
  const markAllAsSeenMutation = useMarkAllAsSeenMutation();

  const unseenCount = (unseenCountData as any)?.count || 0;
  const notifications = notificationsData?.notifications || [];
  const hasMore = notificationsData?.hasMore || false;

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: any) => {
    // Mark as seen
    await markAsSeenMutation.mutateAsync(notification.id);
    
    // Refetch unseen count to update badge
    refetchUnseenCount();
    
    // Navigate to product page
    if (notification.product?.url) {
      router.push(notification.product.url);
    }
    
    // Close popover
    setIsOpen(false);
  };

  const handleMarkAllAsSeen = async () => {
    await markAllAsSeenMutation.mutateAsync();
    // Refetch unseen count to update badge
    refetchUnseenCount();
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleTogglePopover = () => {
    if (!isOpen) {
      // Refetch unseen count when opening popover
      refetchUnseenCount();
    }
    setIsOpen(!isOpen);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <button
        ref={buttonRef}
        className={getClasses([styles.notificationButton, scrolled && styles.scrolled])}
        onClick={handleTogglePopover}
        aria-label="Notifications"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z"
            fill="currentColor"
          />
        </svg>
        {unseenCount > 0 && (
          <span className={styles.badge}>{unseenCount > 99 ? '99+' : unseenCount}</span>
        )}
      </button>

      {isOpen && (
        <div ref={popoverRef} className={styles.popover}>
          <div className={styles.header}>
            <h3 className={styles.title}>Notifications</h3>
            {unseenCount > 0 && (
              <button
                className={styles.markAllButton}
                onClick={handleMarkAllAsSeen}
                disabled={markAllAsSeenMutation.isPending}
              >
                {markAllAsSeenMutation.isPending ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </div>

          <div className={styles.content}>
            {isLoading ? (
              <div className={styles.loading}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>No notifications yet</div>
            ) : (
              <>
                <div className={styles.notificationsList}>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`${styles.notificationItem} ${
                        !notification.seenAt ? styles.unseen : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={styles.notificationContent}>
                        <p className={styles.message}>{notification.message}</p>
                        <span className={styles.time}>
                          {formatTimeAgo(notification.createdAt.toString())}
                        </span>
                      </div>
                      {notification.product?.images?.[0] && (
                        <div className={styles.productImage}>
                          <img
                            src={notification.product.images[0]}
                            alt={notification.product.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <button
                    className={styles.loadMoreButton}
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    Load More
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 