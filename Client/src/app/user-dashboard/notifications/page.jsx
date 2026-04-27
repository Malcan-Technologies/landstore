"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loading from "@/components/common/Loading";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import NotificationList from "@/components/userDashboard/notifications/NotificationList";

const NotificationsPage = () => {
  const { isAuth, user, hydrated } = useSelector((state) => state.auth);
  const notificationUserId = hydrated && isAuth && user?.id ? user.id : "";
  const {
    notifications,
    unreadCount,
    isLoading,
    loadError,
    isMarkingAllRead,
    markNotificationRead,
    markAllNotificationsRead,
  } = useRealtimeNotifications({
    enabled: hydrated && isAuth && Boolean(notificationUserId),
    userId: notificationUserId,
    limit: 5,
  });

  const handleNotificationClick = async (notification) => {
    if (!notification?.id || notification?.read) {
      return;
    }

    await markNotificationRead(notification.id);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
  };

  if (!hydrated || isLoading) {
    return <Loading />;
  }

  return (
    <main className="bg-background-primary py-8 sm:py-8 md:py-10">
      <div className="mx-auto w-full max-w-245 px-4 sm:px-5 md:px-6">
        <header className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:gap-4 md:mb-6">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-gray2 sm:text-[28px] md:text-[32px]">Notifications</h1>
            <p className="mt-1 max-w-60 text-[12px] leading-5 text-gray5 sm:max-w-none sm:text-[15px] sm:leading-6 md:text-[18px]">Stay updated on your listings and enquiries</p>
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || isMarkingAllRead}
            className="mt-2 text-[12px] font-medium text-green-primary transition hover:text-green-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:mt-3 sm:text-[14px] md:mt-4 md:text-[15px]"
          >
            {isMarkingAllRead ? "Marking..." : "Mark all as read"}
          </button>
        </header>

        {loadError ? (
          <div className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#B42318]">
            {loadError}
          </div>
        ) : null}

        {!loadError && notifications.length === 0 ? (
          <div className="mb-4 rounded-xl border border-border-card bg-white px-4 py-3 text-[14px] text-gray5">
            No notifications found.
          </div>
        ) : null}

        <NotificationList notifications={notifications} onNotificationClick={handleNotificationClick} />
      </div>
    </main>
  );
};

export default NotificationsPage;
