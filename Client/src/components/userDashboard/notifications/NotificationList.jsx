import Link from "next/link";

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
  return (
    <div className="space-y-4">
      {notifications.map((notification) => {
        const style = notificationTypeStyles[notification.type] ?? notificationTypeStyles.info;

        return (
          <article key={notification.id} className="rounded-2xl border border-border-card bg-white px-6 py-5 shadow-[0px_4px_18px_rgba(15,61,46,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <div className={`mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.iconWrapperClassName}`}>
                  {style.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-[18px] font-semibold leading-7 text-gray2">{notification.title}</h2>
                  <p className="mt-1 text-[16px] leading-7 text-gray5">{notification.message}</p>

                  {notification.feedbackMessage ? (
                    <div className={`mt-4 rounded-xl px-4 py-3 ${style.feedbackWrapperClassName}`}>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.08em]">{notification.feedbackTitle}</p>
                      <p className="mt-1 text-[14px] italic leading-6">&quot;{notification.feedbackMessage}&quot;</p>
                    </div>
                  ) : null}

                  <Link href={notification.href} className={`mt-4 inline-flex items-center gap-2 text-[15px] font-medium transition ${style.linkClassName}`}>
                    <span>View details</span>
                    <Details size={18} />
                  </Link>
                </div>
              </div>
              <p className="shrink-0 pt-1 text-[16px] font-medium text-[#9CA3AF]">{notification.timeLabel}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default NotificationList;
