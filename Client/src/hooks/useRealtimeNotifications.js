"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationService } from "@/services/notificationService";
import {
  acquireSocketConnection,
  SOCKET_EVENTS,
  markAllNotificationsAsReadWithSocket,
  markNotificationAsReadWithSocket,
  onSocketEvent,
  offSocketEvent,
  releaseSocketConnection,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from "@/services/socketService";
import {
  getUnreadNotificationCount,
  mapNotificationsToUiItems,
  markAllNotificationItemsRead,
  markNotificationItemRead,
  removeNotificationItem,
  upsertNotificationItem,
} from "@/utils/notifications";

export const useRealtimeNotifications = ({
  enabled,
  userId,
  limit = 5,
  href = "/user-dashboard/notifications",
} = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(enabled));
  const [loadError, setLoadError] = useState("");
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      setLoadError("");
      return;
    }

    let mounted = true;

    (async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await notificationService.getNotifications({ page: 1, limit });
        const items = Array.isArray(response) ? response : response?.data;
        const mappedItems = mapNotificationsToUiItems(items, href);

        if (mounted) {
          setNotifications(mappedItems);
          setUnreadCount(getUnreadNotificationCount(mappedItems));
        }
      } catch (error) {
        if (mounted) {
          setNotifications([]);
          setUnreadCount(0);
          setLoadError(error?.message || "Failed to load notifications.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [enabled, href, limit, userId]);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    acquireSocketConnection();

    const handleCreated = (payload) => {
      if (String(payload?.userId || "") !== String(userId)) {
        return;
      }

      setNotifications((currentItems) => upsertNotificationItem(currentItems, payload, href, limit));
      setLoadError("");
    };

    const handleUpdated = (payload) => {
      if (String(payload?.userId || "") !== String(userId)) {
        return;
      }

      setNotifications((currentItems) => upsertNotificationItem(currentItems, payload, href, limit));
    };

    const handleDeleted = (payload) => {
      if (String(payload?.userId || "") !== String(userId)) {
        return;
      }

      setNotifications((currentItems) => removeNotificationItem(currentItems, payload?.id));
    };

    const handleUnreadCount = (payload) => {
      if (String(payload?.userId || "") !== String(userId)) {
        return;
      }

      if (typeof payload?.unreadCount === "number") {
        setUnreadCount(payload.unreadCount);
      }
    };

    onSocketEvent(SOCKET_EVENTS.NOTIFICATION.CREATED, handleCreated);
    onSocketEvent(SOCKET_EVENTS.NOTIFICATION.UPDATED, handleUpdated);
    onSocketEvent(SOCKET_EVENTS.NOTIFICATION.DELETED, handleDeleted);
    onSocketEvent(SOCKET_EVENTS.NOTIFICATION.UNREAD_COUNT, handleUnreadCount);

    let subscribed = true;

    (async () => {
      try {
        const response = await subscribeToNotifications();
        if (subscribed && typeof response?.data?.unreadCount === "number") {
          setUnreadCount(response.data.unreadCount);
        }
      } catch {
      }
    })();

    return () => {
      subscribed = false;
      offSocketEvent(SOCKET_EVENTS.NOTIFICATION.CREATED, handleCreated);
      offSocketEvent(SOCKET_EVENTS.NOTIFICATION.UPDATED, handleUpdated);
      offSocketEvent(SOCKET_EVENTS.NOTIFICATION.DELETED, handleDeleted);
      offSocketEvent(SOCKET_EVENTS.NOTIFICATION.UNREAD_COUNT, handleUnreadCount);
      unsubscribeFromNotifications();
      releaseSocketConnection();
    };
  }, [enabled, href, limit, userId]);

  const markNotificationRead = useCallback(async (notificationId) => {
    if (!enabled || !notificationId) {
      return false;
    }

    setNotifications((currentItems) => markNotificationItemRead(currentItems, notificationId));

    try {
      await markNotificationAsReadWithSocket(notificationId);
      return true;
    } catch {
      try {
        await notificationService.markAsRead(notificationId);
        return true;
      } catch {
        return false;
      }
    }
  }, [enabled]);

  const markAllNotificationsRead = useCallback(async () => {
    if (!enabled || isMarkingAllRead) {
      return false;
    }

    setIsMarkingAllRead(true);
    setNotifications((currentItems) => markAllNotificationItemsRead(currentItems));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsReadWithSocket();
      return true;
    } catch {
      try {
        await notificationService.markAllAsRead(userId);
        return true;
      } catch {
        return false;
      }
    } finally {
      setIsMarkingAllRead(false);
    }
  }, [enabled, isMarkingAllRead, userId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadError,
    isMarkingAllRead,
    markNotificationRead,
    markAllNotificationsRead,
  };
};
