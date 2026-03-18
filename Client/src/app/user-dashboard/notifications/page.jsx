import NotificationList from "@/components/userDashboard/notifications/NotificationList";
import { fullNotificationItems } from "@/components/userDashboard/notifications/notificationData";

const NotificationsPage = () => {
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

        <NotificationList notifications={fullNotificationItems} />
      </div>
    </main>
  );
};

export default NotificationsPage;
