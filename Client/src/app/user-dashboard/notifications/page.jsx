"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import NotificationList from "@/components/userDashboard/notifications/NotificationList";
import { notificationService } from "@/services/notificationService";

const NotificationsPage = () => {
  const { isAuth, user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuth || !user?.id) {
      setNotifications([]);
      return;
    }

    let mounted = true;

    const mapNotification = (item) => {
      const apiType = item?.type;
      const type = apiType === "urgent" ? "warning" : "success";
      const createdAt = item?.createdAt ? new Date(item.createdAt) : null;

      return {
        id: item?.id,
        title: apiType === "urgent" ? "Action needed" : "Notification",
        message: item?.content || "",
        timeLabel: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString() : "",
        type,
        href: "/user-dashboard/notifications",
        read: Boolean(item?.isRead),
      };
    };

    (async () => {
      try {
        const response = await notificationService.getNotifications({ page: 1, limit: 5, userId: user.id });
        const items = Array.isArray(response) ? response : response?.data;
        const mapped = Array.isArray(items) ? items.map(mapNotification).filter((n) => n?.id) : [];
        if (mounted) {
          setNotifications(mapped);
        }
      } catch (_error) {
        if (mounted) {
          setNotifications([]);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isAuth, user?.id]);

  return (
    <main className="bg-background-primary py-8 sm:py-8 md:py-10">
      <div className="mx-auto w-full max-w-245 px-4 sm:px-5 md:px-6">
        <header className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:gap-4 md:mb-6">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-gray2 sm:text-[28px] md:text-[32px]">Notifications</h1>
            <p className="mt-1 max-w-[240px] text-[12px] leading-5 text-gray5 sm:max-w-none sm:text-[15px] sm:leading-6 md:text-[18px]">Stay updated on your listings and enquiries</p>
          </div>
          <button type="button" className="mt-2 text-[12px] font-medium text-green-primary transition hover:text-green-secondary sm:mt-3 sm:text-[14px] md:mt-4 md:text-[15px]">
            Clear all
          </button>
        </header>

        <NotificationList notifications={notifications} />
      </div>
    </main>
  );
};

export default NotificationsPage;
