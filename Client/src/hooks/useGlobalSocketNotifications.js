"use client";

import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import {
  acquireSocketConnection,
  SOCKET_EVENTS,
  onSocketEvent,
  offSocketEvent,
  releaseSocketConnection,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from "@/services/socketService";
import { showToast } from "@/utils/toastStore";
import { getStoredUser, hasAdminAccess } from "@/utils/auth";

const getUserRoute = (user, data) => {
  const isAdmin = hasAdminAccess(user);

  if (data?.enquiryId) {
    return isAdmin
      ? `/admin/enquiry-hub/${data.enquiryId}`
      : `/user-dashboard/enquiries/${data.enquiryId}`;
  }

  if (data?.notificationId) {
    return isAdmin
      ? `/admin/notifications`
      : `/user-dashboard/notifications`;
  }

  return isAdmin ? "/admin" : "/user-dashboard";
};


export const useGlobalSocketNotifications = (enabled = true) => {
  const router = useRouter();

  useEffect(() => {

    if (!enabled || typeof window === "undefined") {
      return;
    }

    const user = getStoredUser();

    if (!user?.token) {
      return;
    }

    acquireSocketConnection();

    const handleNewMessage = (payload) => {

      const currentUser = getStoredUser();

      if (!currentUser?.token) {
        return;
      }

      const isOwnMessage = String(payload?.senderId) === String(currentUser?.id);

      if (isOwnMessage) {
        return;
      }

      const enquiryId = payload?.enquiryId || payload?.data?.enquiryId;
      const senderName = payload?.senderName || payload?.sender?.name || "New message";
      const messagePreview = payload?.content
        ? payload.content.slice(0, 40) + (payload.content.length > 40 ? "..." : "")
        : "";

      const toastData = {
        type: "socket",
        title: senderName,
        message: messagePreview || "New message received",
        duration: 6000,
        data: {
          href: getUserRoute(currentUser, { enquiryId }),
          enquiryId,
          type: "chat",
        },
      };
      showToast(toastData);
    };

    const handleNotificationCreated = (payload) => {
      const currentUser = getStoredUser();
      if (!currentUser?.token) return;

      if (String(payload?.userId) !== String(currentUser?.id)) return;

      const title = payload?.title || "New notification";
      const message = payload?.message || payload?.body || "";
      const notificationId = payload?.id || payload?.notificationId;

      showToast({
        type: "socket",
        title,
        message: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        duration: 5000,
        data: {
          href: getUserRoute(currentUser, { notificationId }),
          notificationId,
          type: "notification",
        },
      });
    };

    const handleNotificationUpdated = (payload) => {
      const currentUser = getStoredUser();
      if (!currentUser?.token) return;

      if (String(payload?.userId) !== String(currentUser?.id)) return;
      if (payload?.read) return;

      const title = payload?.title || "Notification updated";
      const message = payload?.message || payload?.body || "";

      showToast({
        type: "socket",
        title,
        message: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        duration: 5000,
        data: {
          href: getUserRoute(currentUser, { notificationId: payload?.id }),
          notificationId: payload?.id,
          type: "notification",
        },
      });
    };

    onSocketEvent(SOCKET_EVENTS.CHAT.NEW_MESSAGE, handleNewMessage);
    onSocketEvent(SOCKET_EVENTS.NOTIFICATION.CREATED, handleNotificationCreated);
    onSocketEvent(SOCKET_EVENTS.NOTIFICATION.UPDATED, handleNotificationUpdated);

    void subscribeToNotifications();

    return () => {
      offSocketEvent(SOCKET_EVENTS.CHAT.NEW_MESSAGE, handleNewMessage);
      offSocketEvent(SOCKET_EVENTS.NOTIFICATION.CREATED, handleNotificationCreated);
      offSocketEvent(SOCKET_EVENTS.NOTIFICATION.UPDATED, handleNotificationUpdated);
      unsubscribeFromNotifications();
      releaseSocketConnection();
    };
  }, [enabled, router]);
};

export default useGlobalSocketNotifications;
