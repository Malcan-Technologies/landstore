import Link from "next/link";

import Exclamation from "@/components/svg/Exclamation";
import Sheild from "@/components/svg/Sheild";

const notificationTypeStyles = {
  success: {
    iconClassName: "bg-[#EAF8F1]",
    icon: <Sheild size={18} color="#298064" />,
  },
  danger: {
    iconClassName: "bg-[#FEF2F2]",
    icon: <Exclamation size={18} color="#EF4848" />,
  },
  info: {
    iconClassName: "bg-[#EEF4FF]",
    icon: <Exclamation size={18} color="#2563EB" />,
  },
  warning: {
    iconClassName: "bg-[#FFF7E8]",
    icon: <Exclamation size={18} color="#F59E0B" />,
  },
};

const NotificationPopup = ({ notifications = [], onClose }) => {
  return (
    <div className="absolute right-0 top-[calc(100%+12px)] z-40 w-96 overflow-hidden rounded-[18px] border border-border-card bg-white shadow-[0px_24px_60px_rgba(15,61,46,0.12)]">
      <div className="flex items-center justify-between border-b border-border-card px-4 py-3">
        <h3 className="text-[15px] font-semibold text-gray2">Notification</h3>
        <Link href="/user-dashboard/notifications" onClick={onClose} className="text-[14px] font-medium text-green-primary transition hover:text-green-secondary">
          View all
        </Link>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {notifications.map((notification, index) => {
          const style = notificationTypeStyles[notification.type] ?? notificationTypeStyles.info;

          return (
            <Link
              key={notification.id}
              href={notification.href}
              onClick={onClose}
              className={`block px-4 py-3 transition hover:bg-background-primary ${index !== notifications.length - 1 ? "border-b border-border-card" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${style.iconClassName}`}>
                  {style.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[15px] font-semibold leading-5 text-gray2">{notification.title}</p>
                    <span className="whitespace-nowrap text-[12px] text-gray5">{notification.timeLabel}</span>
                  </div>
                  <p className="mt-1 text-[14px] leading-5 text-gray5">{notification.message}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-12 w-full items-center justify-center border-t border-border-card text-[15px] font-medium text-gray5 transition hover:bg-background-primary hover:text-gray2"
      >
        Mark all as read
      </button>
    </div>
  );
};

export default NotificationPopup;
