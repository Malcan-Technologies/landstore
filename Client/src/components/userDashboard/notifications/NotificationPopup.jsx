"use client";

import { useRouter } from "next/navigation";

import Exclamation from "@/components/svg/Exclamation";
import Sheild from "@/components/svg/Sheild";
import Check from "@/components/svg/Check";
import RoundCheck from "@/components/svg/RoundCheck";

const notificationTypeStyles = {
  success: {
    itemClassName: "bg-[#F4FBF7]",
    // iconClassName: "bg-[#EAF8F1]",
    icon: <RoundCheck size={18} color="#298064" />,
  },
  danger: {
    itemClassName: "bg-[#FFF5F5]",
    // iconClassName: "bg-[#FEF2F2]",
    icon: <Exclamation size={18} color="#EF4848" />,
  },
  info: {
    itemClassName: "bg-[#F3F7FF]",
    // iconClassName: "bg-[#EEF4FF]",
    icon: <Exclamation size={18} color="#2563EB" />,
  },
  warning: {
    itemClassName: "bg-[#FFFBF2]",
    // iconClassName: "bg-[#FFF7E8]",
    icon: <Exclamation size={18} color="#F59E0B" />,
  },
};

const NotificationPopup = ({ notifications = [], onClose }) => {
  const router = useRouter();

  const handleNavigate = (href) => {
    onClose?.();
    router.push(href);
  };

  return (
    <div className="absolute left-1/2 top-[calc(100%+10px)] z-40 w-[min(18rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-[18px] border border-border-card bg-white shadow-[0px_24px_60px_rgba(15,61,46,0.12)] sm:top-[calc(100%+12px)] sm:w-[22rem] md:left-auto md:right-0 md:w-96 md:translate-x-0">
      <div className="flex items-center justify-between border-b border-border-card px-3 py-2.5 sm:px-4 sm:py-3">
        <h3 className="text-[13px] font-semibold text-gray2 sm:text-[14px] md:text-[15px]">Notification</h3>
        <button type="button" onClick={() => handleNavigate("/user-dashboard/notifications")} className="text-[12px] font-medium text-green-primary transition hover:text-green-secondary sm:text-[13px] md:text-[14px]">
          View all
        </button>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {notifications.map((notification, index) => {
          const style = notificationTypeStyles[notification.type] ?? notificationTypeStyles.info;

          return (
            <button
              type="button"
              key={notification.id}
              onClick={() => handleNavigate(notification.href)}
              className={`block px-3 py-2.5 transition hover:brightness-[0.99] sm:px-4 sm:py-3 ${style.itemClassName} ${index !== notifications.length - 1 ? "border-b border-border-card" : ""}`}
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md sm:h-6 sm:w-6 ${style.iconClassName}`}>
                  {style.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold leading-4 text-gray2 sm:text-[14px] sm:leading-5 md:text-[15px]">{notification.title}</p>
                    <span className="whitespace-nowrap text-[9px] text-gray5 sm:text-[9px] md:text-[10px]">{notification.timeLabel}</span>
                  </div>
                  <p className="mt-1 text-[10px] leading-4 text-left text-gray5 sm:text-[11px] sm:leading-5 md:text-[12px]">{notification.message}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-full items-center justify-center border-t border-border-card text-[13px] font-medium text-gray5 transition hover:bg-background-primary hover:text-gray2 sm:h-11 sm:text-[14px] md:h-12 md:text-[15px]"
      >
        Mark all as read
      </button>
    </div>
  );
};

export default NotificationPopup;
