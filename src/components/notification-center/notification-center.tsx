"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useNotificationsQuery, useUnseenCountQuery, useMarkAsSeenMutation, useMarkAllAsSeenMutation } from '../../api/notification/queries';
import { useRouter } from 'next/navigation';
import styles from './notification-center.module.css';
import getClasses from '../../utils/get-classes';
import { Loader } from '../loader/loader';

interface NotificationCenterProps {
  className?: string;
  scrolled?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className, scrolled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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

  // Update allNotifications when new data comes in
  useEffect(() => {
    if (notificationsData?.notifications) {
      if (currentPage === 1) {
        // First page - replace all
        setAllNotifications(notificationsData.notifications);
      } else {
        // Subsequent pages - append
        setAllNotifications(prev => [...prev, ...notificationsData.notifications]);
      }
    }
  }, [notificationsData, currentPage]);

  // Reset when filter changes
  useEffect(() => {
    setCurrentPage(1);
    // Don't clear allNotifications - keep them in memory for filtering
  }, [filterTab]);

  // Filtering logic
  const filteredNotifications = filterTab === 'all'
    ? allNotifications
    : allNotifications.filter((n) => !n.seenAt);

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
    // Optimistically update local state
    setAllNotifications(prev => 
      prev.map(n => 
        n.id === notification.id 
          ? { ...n, seenAt: new Date().toISOString() }
          : n
      )
    );
    
    // Mark as seen
    await markAsSeenMutation.mutateAsync(notification.id);
    
    // Refetch unseen count to update badge
    refetchUnseenCount();
    
    // Navigate to product page and close popover
    if (notification.product?.url) {
      window.open(notification.product.url, '_blank');
    //   router.push(notification.product.url);
    }
    
    // Do NOT close popover for other actions
  };

  const handleMarkAllAsSeen = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent bubbling to outside click
    
    // Optimistically update local state
    setAllNotifications(prev => 
      prev.map(notification => ({
        ...notification,
        seenAt: new Date().toISOString()
      }))
    );
    
    await markAllAsSeenMutation.mutateAsync();
    // Refetch unseen count to update badge
    refetchUnseenCount();
    // Do NOT close popover
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
    // The useEffect will handle appending the new notifications
    // We'll set loading to false when new data arrives
  };

  // Reset loading when new data arrives
  useEffect(() => {
    if (notificationsData) {
      setIsLoadingMore(false);
    }
  }, [notificationsData]);

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

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={getClasses([
                styles.tab,
                filterTab === 'all' && styles.tabActive,
              ])}
              onClick={() => setFilterTab('all')}
              type="button"
            >
              All
            </button>
            <button
              className={getClasses([
                styles.tab,
                filterTab === 'unread' && styles.tabActive,
              ])}
              onClick={() => setFilterTab('unread')}
              type="button"
            >
              Unread
            </button>
          </div>

          <div className={styles.content}>
            {isLoading && currentPage === 1 ? (
              <div className={styles.loading}>Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className={styles.empty}>No notifications yet</div>
            ) : (
              <>
                <div className={styles.notificationsList}>
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={getClasses([
                        styles.notificationItem,
                        !notification.seenAt && styles.unseen,
                      ])}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Product image on the left */}
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
                      <div className={styles.notificationContent}>
                        <p className={styles.message}>{notification.message}</p>
                        <span className={styles.time}>
                          {formatTimeAgo(notification.createdAt.toString())}
                        </span>
                      </div>
                      {/* Blue dot on right, always reserve space */}
                      {!notification.seenAt ? (
                        <span className={styles.unseenDot} />
                      ) : (
                        <span className={styles.unseenDotPlaceholder} />
                      )}
                    </div>
                  ))}
                </div>

                {isLoadingMore && (
                  <div className={styles.loadingMore}>Loading more notifications...</div>
                )}

                {hasMore && !isLoadingMore && (
                  <button
                    className={styles.seePreviousBtn}
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    type="button"
                  >
                    See previous notifications
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