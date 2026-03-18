"use client";

import { useRouter } from "next/navigation";

import Details from "@/components/svg/Details";
import Exclamation from "@/components/svg/Exclamation";
import Sheild from "@/components/svg/Sheild";

const notificationTypeStyles = {
  success: {
    iconWrapperClassName: "bg-[#EAF8F1]",
    icon: <Sheild size={20} color="#298064" />,
    linkClassName: "text-green-primary hover:text-green-secondary",
  },
  danger: {
    iconWrapperClassName: "bg-[#FEF2F2]",
    icon: <Exclamation size={20} color="#EF4848" />,
    linkClassName: "text-green-primary hover:text-green-secondary",
    feedbackWrapperClassName: "bg-[#FFF1F1] text-[#EF4444]",
  },
  info: {
    iconWrapperClassName: "bg-[#EEF4FF]",
    icon: <Exclamation size={20} color="#2563EB" />,
    linkClassName: "text-green-primary hover:text-green-secondary",
  },
  warning: {
    iconWrapperClassName: "bg-[#FFF7E8]",
    icon: <Exclamation size={20} color="#F59E0B" />,
    linkClassName: "text-green-primary hover:text-green-secondary",
  },
};

const NotificationList = ({ notifications = [] }) => {
  const router = useRouter();

  return (
    <div className="space-y-3 sm:space-y-4">
      {notifications.map((notification) => {
        const style = notificationTypeStyles[notification.type] ?? notificationTypeStyles.info;

        return (
          <article key={notification.id} className="relative rounded-xl border border-border-card bg-white px-3 py-3 shadow-[0px_4px_18px_rgba(15,61,46,0.04)] sm:rounded-2xl sm:px-4 sm:py-4 md:px-6 md:py-5">
            <p className="absolute right-3 top-3 text-[10px] font-medium text-[#9CA3AF] sm:right-4 sm:top-4 sm:text-[12px] md:right-6 md:top-5 md:text-[16px]">
              {notification.timeLabel}
            </p>

            <div className="flex items-start gap-2.5 pr-18 sm:gap-3 sm:pr-26 md:gap-4 md:pr-34">
              <div className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl md:mt-1 md:h-12 md:w-12 ${style.iconWrapperClassName}`}>
                {style.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[14px] font-semibold leading-5 text-gray2 sm:text-[16px] sm:leading-6 md:text-[18px] md:leading-7">{notification.title}</h2>
                <p className="mt-1 text-[12px] leading-5 text-gray5 sm:text-[14px] sm:leading-6 md:text-[16px] md:leading-7">{notification.message}</p>

                {notification.feedbackMessage ? (
                  <div className={`mt-3 rounded-lg px-3 py-2.5 sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3 ${style.feedbackWrapperClassName}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] sm:text-[11px] md:text-[12px]">{notification.feedbackTitle}</p>
                    <p className="mt-1 text-[11px] italic leading-5 sm:text-[13px] sm:leading-6 md:text-[14px]">&quot;{notification.feedbackMessage}&quot;</p>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => router.push(notification.href)}
                  className={`mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium transition sm:mt-4 sm:gap-2 sm:text-[14px] md:text-[15px] ${style.linkClassName}`}
                >
                  <span>View details</span>
                  <Details size={16} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default NotificationList;
