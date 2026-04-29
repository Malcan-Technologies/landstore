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

console.log("[GlobalSocket] HOOK FILE LOADED");

export const useGlobalSocketNotifications = (enabled = true) => {
  console.log("[GlobalSocket] HOOK CALLED with enabled:", enabled);
  const router = useRouter();

  useLayoutEffect(() => {
    console.log("[GlobalSocket] LAYOUT EFFECT running, enabled:", enabled);
  }, [enabled]);

  useEffect(() => {
    console.log("[GlobalSocket] EFFECT running, enabled:", enabled);

    if (!enabled || typeof window === "undefined") {
      console.log("[GlobalSocket] Disabled or SSR, skipping");
      return;
    }

    const user = getStoredUser();
    console.log("[GlobalSocket] User:", user?.id, "has token:", !!user?.token);

    if (!user?.token) {
      console.log("[GlobalSocket] No token, aborting");
      return;
    }

    console.log("[GlobalSocket] Acquiring socket connection...");
    acquireSocketConnection();

    const handleNewMessage = (payload) => {
      console.log("[GlobalSocket] 📨 NEW_MESSAGE received:", payload);

      const currentUser = getStoredUser();
      console.log("[GlobalSocket] Current user:", currentUser?.id, "token:", !!currentUser?.token);

      if (!currentUser?.token) {
        console.log("[GlobalSocket] No current user token, skipping");
        return;
      }

      const isOwnMessage = String(payload?.senderId) === String(currentUser?.id);
      console.log("[GlobalSocket] Is own message?", isOwnMessage, "sender:", payload?.senderId, "me:", currentUser?.id);

      if (isOwnMessage) {
        console.log("[GlobalSocket] Skipping own message");
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
      console.log("[GlobalSocket] 🍞 Showing toast:", toastData);
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

    console.log("[GlobalSocket] Registering event listeners...");
    onSocketEvent(SOCKET_EVENTS.CHAT.NEW_MESSAGE, handleNewMessage);
    onSocketEvent(SOCKET_EVENTS.NOTIFICATION.CREATED, handleNotificationCreated);
    onSocketEvent(SOCKET_EVENTS.NOTIFICATION.UPDATED, handleNotificationUpdated);
    console.log("[GlobalSocket] ✅ Listeners registered for:", SOCKET_EVENTS.CHAT.NEW_MESSAGE, SOCKET_EVENTS.NOTIFICATION.CREATED);

    console.log("[GlobalSocket] Subscribing to notifications...");
    void subscribeToNotifications().then((response) => {
      console.log("[GlobalSocket] Notification subscription response:", response);
    }).catch((err) => {
      console.log("[GlobalSocket] Notification subscription error:", err);
    });

    return () => {
      console.log("[GlobalSocket] 🧹 Cleanup - removing listeners and unsubscribing");
      offSocketEvent(SOCKET_EVENTS.CHAT.NEW_MESSAGE, handleNewMessage);
      offSocketEvent(SOCKET_EVENTS.NOTIFICATION.CREATED, handleNotificationCreated);
      offSocketEvent(SOCKET_EVENTS.NOTIFICATION.UPDATED, handleNotificationUpdated);
      unsubscribeFromNotifications();
      releaseSocketConnection();
    };
  }, [enabled, router]);
};

export default useGlobalSocketNotifications;
